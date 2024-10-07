import oracledb from 'oracledb';

export class Charge {


  // Function to get a connection to the database
  async getConnection() {
    try {
      return await oracledb.getConnection();
    } catch (err) {
      throw new Error('Error establishing database connection: ' + err.message);
    }
  }

  // Function to check if a charge exists in the database
  async chargeExists(billingEvent) {

    let connection=await this.getConnection();

    const checkSql = `SELECT COUNT(*) AS count FROM BILLING_EVENT WHERE BILLING_EVENT_ID_EXTERNAL = :externalBillingEventId`;
    const checkBinds = { externalBillingEventId: billingEvent.BillingEventID };

    try {
      const result = await connection.execute(checkSql, checkBinds);

      if (result.rows[0][0] > 0) {
        return true;
      }else{
        return false;
      }

    } catch (err) {
      throw new Error('Error checking if charge exists:' + err.message);
    }finally {
      await connection.close();
    }
  } 

  // Function to insert a new charge record
async insert(billingEvent, source) {
  let connection = await this.getConnection();

  const insertSql = `
    INSERT INTO BILLING_EVENT (
      BILLING_EVENT_ID_EXTERNAL, PATIENT_ID, PATIENT_EXTERNAL_ID, FACILITY_ID,
      FACILITY_EXTERNAL_ID, PLACE_OF_SERVICE_CODE, ENCOUNTER_ID, DATE_OF_SERVICE, MEDICAID_NUMBER,
      PATIENT_FIRST, PATIENT_MIDDLE, PATIENT_LAST, PATIENT_DOB, PATIENT_SSN, PATIENT_GENDER, PATIENT_PHONE,
      PATIENT_MOBILE_PHONE, IS_ACO, PATIENT_ADDRESS_LINE1, PATIENT_ADDRESS_LINE2, PATIENT_CITY, PATIENT_STATE, PATIENT_ZIP,
      PROVIDER_FIRST_NAME, PROVIDER_LAST_NAME, PROVIDER_NPI, PROVIDER_TIN, PROVIDER_ID, PROVIDER_EXTERNAL_ID, SOURCE
    ) 
    VALUES (
      :billingEventIdExternal, :patientId, :patientExternalId, :facilityId, :facilityExternalId,
      :placeOfserviceCode, :encounterId, TO_DATE(:dateOfservice, 'YYYY-MM-DD'), :medicaidNumber,
      :patientFirst, :patientMiddle, :patientLast, TO_DATE(:patientDob, 'YYYY-MM-DD'), :patientSsn, 
      :patientGender, :patientPhone, :patientMobilePhone, :isAco, :patientAddressLine1, :patientAddressLine2, 
      :patientCity, :patientState, :patientZip, :providerFirstName, :providerLastName, :providerNpi, 
      :providerTin, :providerId, :providerExternalId, :source
    ) 
    RETURNING BILLING_EVENT_ID INTO :incomingBillingEventId`;

  const insertBinds = {
    incomingBillingEventId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    billingEventIdExternal: billingEvent.BillingEventID,
    patientId: billingEvent.PatientID,
    patientExternalId: billingEvent.PatientExternalID,
    facilityId: billingEvent.FacilityID,
    facilityExternalId: billingEvent.FacilityExternalID,
    placeOfserviceCode: billingEvent.PlaceOfServiceCode,
    encounterId: billingEvent.EncounterID,
    dateOfservice: billingEvent.DateOfService,
    medicaidNumber: billingEvent.MedicaidNumber,
    patientFirst: billingEvent.Patient.PatientFirst,
    patientMiddle: billingEvent.Patient.PatientMiddle,
    patientLast: billingEvent.Patient.PatientLast,
    patientDob: billingEvent.Patient.PatientDOB,
    patientSsn: billingEvent.Patient.PatientSSN,
    patientGender: billingEvent.Patient.PatientGender,
    patientPhone: billingEvent.Patient.PatientPhone,
    patientMobilePhone: billingEvent.Patient.PatientMobilePhone,
    isAco: billingEvent.Patient.IsACO ? 'Y' : 'N',
    patientAddressLine1: billingEvent.Patient.PatientAddress.AddressLine1,
    patientAddressLine2: billingEvent.Patient.PatientAddress.AddressLine2,
    patientCity: billingEvent.Patient.PatientAddress.City,
    patientState: billingEvent.Patient.PatientAddress.State,
    patientZip: billingEvent.Patient.PatientAddress.Zip,
    providerFirstName: billingEvent.Provider.FirstName,
    providerLastName: billingEvent.Provider.LastName,
    providerNpi: billingEvent.Provider.NPI,
    providerTin: billingEvent.Provider.TIN,
    providerId: billingEvent.Provider.ProviderID,
    providerExternalId: billingEvent.Provider.ProviderExternalID,
    source: source,
  };

  try {
    const result = await connection.execute(insertSql, insertBinds, { autoCommit: true });
    return { success: true, id: result.outBinds.incomingBillingEventId[0] };
  } catch (err) {
    throw new Error('Error inserting Charge record: ' + err.message);
  } finally {
    await connection.close();
  }
}
// Function to insert patient's charge details with batch processing for ICD and Modifiers
async insertCharges(charges, billingEventId) {
  let connection = await this.getConnection();

  const chargeSql = `
    INSERT INTO CHARGES (BILLING_EVENT_ID, CPT, TIME_SPENT, UNITS)
    VALUES (:billingEventId, :cpt, :timeSpent, :units)
    RETURNING CHARGE_ID INTO :incomingChargeId`;

  const icdSql = `
    INSERT INTO CHARGE_ICD (CHARGE_ID, ICD10, DESCRIPTION)
    VALUES (:chargeId, :icd10, :description)`;

  const modifierSql = `
    INSERT INTO CHARGE_MODIFIERS (CHARGE_ID)
    VALUES (:chargeId)`;

  try {
    for (const charge of charges) {
      const chargeResult = await connection.execute(chargeSql, {
        incomingChargeId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        billingEventId: billingEventId,
        cpt: charge.CPT,
        timeSpent: charge.TimeSpent,
        units: charge.Units
      }, { autoCommit: false });

      const chargeId = chargeResult.outBinds.incomingChargeId[0];

      // Batch insert for ICD data
      if (charge.ICD && charge.ICD.length) {
        const icdBinds = charge.ICD.map(icd => ({
          chargeId: chargeId,
          icd10: icd.ICD10,
          description: icd.Description
        }));
        await connection.executeMany(icdSql, icdBinds, { autoCommit: false });
      }

      // Batch insert for Modifiers
      if (charge.Modifiers && charge.Modifiers.length) {
        const modifierBinds = charge.Modifiers.map(modifier => ({
          chargeId: chargeId
        }));
        await connection.executeMany(modifierSql, modifierBinds, { autoCommit: false });
      }
    }

    // Commit once after processing all charges
    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw new Error('Error inserting Charge record: ' + err.message);
  } finally {
    await connection.close();
  }
}

  
}
