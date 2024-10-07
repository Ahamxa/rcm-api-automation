import oracledb from 'oracledb';

export class QunatusPatient {

  constructor(patientData,source) {
    this.patientData = patientData;
    this.source=source;
  }

  // Function to get a connection to the database
  async getConnection() {
    try {
      return await oracledb.getConnection();
    } catch (err) {
      throw new Error('Error establishing database connection: ' + err.message);
    }
  }

  async patientExists(patientId) {
    const connection = await this.getConnection();
    const checkSql = `SELECT COUNT(*) AS COUNT FROM REG_PATIENT WHERE EXTERNAL_PATIENT_ID = :externalPatientId`;
    
    try {
      const result = await connection.execute(checkSql, { externalPatientId: patientId });
      return result.rows[0][0] > 0;
    } catch (err) {
      throw new Error('Error checking patient existence: ' + err.message);
    } finally {
      await connection.close();
    }
  }

  async insertPatientInActualTable(){

    let connection=await this.getConnection();
    const procedureCallSql = `
    BEGIN
      PRST_REG_P_MGMT.insert_patient(
        ip_practice_id => 261,
        ip_primary_provider => NULL,
        ip_patient_physician => NULL,
        ip_patient_type => NULL,
        ip_lname => :patientLast,
        ip_fname => :patientFirst,
        ip_minitial => NULL,
        ip_mlname => NULL,
        ip_mfname => NULL,
        ip_mminitial => NULL,
        ip_title => NULL,
        ip_address => :patientAddressLine1,
        ip_city => :patientCity,
        ip_state => :patientState,
        ip_zip => :patientZip,
        ip_extzip => NULL,
        ip_sex => :patientGender,
        ip_mstatus => NULL,
        ip_occupation => NULL,
        ip_ssn => :patientSsn,
        ip_mname => NULL,
        ip_dob => TO_DATE(:patientDob, 'YYYY-MM-DD'),
        ip_hphone => :patientPhone,
        ip_wphone => NULL,
        ip_wphone_ext => NULL,
        ip_fax => NULL,
        ip_cell => :patientMobilePhone,
        ip_email => NULL,
        ip_religion => NULL,
        ip_country => NULL,
        ip_empstat => NULL,
        ip_employer => NULL,
        ip_tor => NULL,
        ip_primlang => NULL,
        ip_race => NULL,
        ip_ethnicity => NULL,
        ip_prefered_contact => NULL,
        ip_remarks => NULL,
        ip_death_date => NULL,
        ip_patient_notes => NULL,
        ip_pnt => NULL,
        ip_report_exempt => NULL,
        ip_user_id => NULL,
        ip_user_ip => NULL,
        ip_phymast_id => NULL,
        ip_surname => NULL,
        ip_scan_image_id => NULL,
        ip_patientlogin => NULL,
        ip_patientpassword => NULL,
        ip_deathcause => NULL,
        ip_pcp_f => NULL,
        ip_ref_phy => NULL,
        ip_other_phy => NULL,
        ip_reference_source => NULL,
        ip_health_info_req_f => NULL,
        ip_name_type => NULL,
        ip_mothersurname => NULL,
        ip_default_contact => NULL,
        ip_other_phone => NULL,
        ip_tel_code => NULL,
        ip_tel_equ_code => NULL,
        ip_dnp => NULL,
        ip_user_note => NULL,
        ip_dnp_rsn_id => NULL,
        ip_shoe_size => NULL,
        op_account_number => :accountNumber,
        op_patient_id => :patientId,
        op_pat_name => :patientName,
        op_race => :patientRace
      );
    END;`;

  const procedureBinds = {
    patientLast: this.patientData.PatientLast,
    patientFirst: this.patientData.PatientFirst,
    patientAddressLine1: this.patientData.PatientAddress?.AddressLine1 || null,
    patientCity: this.patientData.PatientAddress?.City || null,
    patientState: this.patientData.PatientAddress?.State || null,
    patientZip: this.patientData.PatientAddress?.Zip || null,
    patientGender: this.patientData.PatientGender,
    patientSsn: this.patientData.PatientSSN,
    patientDob: this.patientData.PatientDOB,
    patientPhone: this.patientData.PatientPhone,
    patientMobilePhone: this.patientData.PatientMobilePhone || null,
    accountNumber: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    patientId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    patientName: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
    patientRace: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }  // Adjust based on your cursor handling
  };


    try {

      let found=await this.patientExists();

      if(!found){

        console.log("patient does not exists in actual tables");

         // Call the procedure to migrate data to the actual table
         const procedureResult = await connection.execute(procedureCallSql, procedureBinds, { autoCommit: true });

         // Optional: Handle the output from the procedure
         const { accountNumber, patientId, patientName } = procedureResult.outBinds;
         console.log(`Account Number: ${accountNumber}, Patient ID: ${patientId}, Patient Name: ${patientName}`);


        const updateSql = `UPDATE REG_PATIENT
                    SET EXTERNAL_PATIENT_ID = :externalPatientId, EXTERNAL_SOURCE_NAME = :source
                    WHERE PATIENT_ID = :patientId`;

        const updateBinds = {
         externalPatientId: this.patientData.PatientID,
         source: this.source,
         patientId: patientId
        };

         // Update externalPatientId and source in the actual table
          await connection.execute(updateSql, updateBinds, { autoCommit: true });

         return { success: true,id: patientId, externalId:this.patientData.PatientID};

        }else{

          console.log("patient found in actual tables")

        return { success: false};
        }

    } catch (err) {
      throw new Error('Error inserting patient record in actual tables: ' + err.message);
    }finally {
      await connection.close();
    }

  }

  async updatePatient() {

    let connection = await this.getConnection();
  
    const updateSql = `UPDATE INTEGRATED_PATIENT SET 
      PATIENT_EVENT_ID = :patientEventId, PATIENT_STATUS = :patientStatus, PATIENT_FIRST = :patientFirst, PATIENT_MIDDLE = :patientMiddle, PATIENT_LAST = :patientLast,
      PATIENT_DOB = TO_DATE(:patientDob, 'YYYY-MM-DD'), PATIENT_SSN = :patientSsn, PATIENT_GENDER = :patientGender, PATIENT_ADDRESS_LINE1 = :patientAddressLine1,
      PATIENT_ADDRESS_LINE2 = :patientAddressLine2, PATIENT_CITY = :patientCity, PATIENT_STATE = :patientState, PATIENT_ZIP = :patientZip, PATIENT_PHONE = :patientPhone,
      PATIENT_MOBILE_PHONE = :patientMobilePhone, PATIENT_FLOOR = :patientFloor, PATIENT_ROOM = :patientRoom, PATIENT_ADMIT_DATE = TO_DATE(:patientAdmitDate, 'YYYY-MM-DD'),
      FACILITY_NAME = :facilityName, PLACE_OF_SERVICE_CODE = :placeOfServiceCode, FACILITY_NPI = :facilityNpi, FACILITY_EXTERNAL_ID = :facilityExternalId,
      FACILITY_ADDRESS_LINE1 = :facilityAddressLine1, FACILITY_ADDRESS_LINE2 = :facilityAddressLine2, FACILITY_CITY = :facilityCity, FACILITY_STATE = :facilityState,
      FACILITY_ZIP = :facilityZip, MEDICARE_NUMBER = :medicareNumber, IS_ACO = :isAco, SOURCE = :source 
      WHERE EXTERNAL_PATIENT_ID = :externalPatientId 
      RETURNING INTEGRATED_PATIENT_ID INTO :updatedPatientId`;
  
    const updatedPatientId = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };
  
    const updateBinds = {
      externalPatientId: this.patientData.PatientID,
      patientEventId: this.patientData.PatientEventID,
      patientStatus: this.patientData.PatientStatus,
      patientFirst: this.patientData.PatientFirst,
      patientMiddle: this.patientData.PatientMiddle,
      patientLast: this.patientData.PatientLast,
      patientDob: this.patientData.PatientDOB,
      patientSsn: this.patientData.PatientSSN,
      patientGender: this.patientData.PatientGender,
      patientAddressLine1: this.patientData.PatientAddress?.AddressLine1 || null,
      patientAddressLine2: this.patientData.PatientAddress?.AddressLine2 || null,
      patientCity: this.patientData.PatientAddress?.City || null,
      patientState: this.patientData.PatientAddress?.State || null,
      patientZip: this.patientData.PatientAddress?.Zip || null,
      patientPhone: this.patientData.PatientPhone,
      patientMobilePhone: this.patientData.PatientMobilePhone,
      patientFloor: this.patientData.PatientFloor,
      patientRoom: this.patientData.PatientRoom,
      patientAdmitDate: this.patientData.PatientAdmitDate.split('T')[0],
      facilityName: this.patientData.Facility?.FacilityName || null,
      placeOfServiceCode: this.patientData.Facility?.PlaceOfServiceCode || null,
      facilityNpi: this.patientData.Facility?.NPI || null,
      facilityExternalId: this.patientData.Facility?.ExternalID || null,
      facilityAddressLine1: this.patientData.Facility?.FacilityAddress?.AddressLine1 || null,
      facilityAddressLine2: this.patientData.Facility?.FacilityAddress?.AddressLine2 || null,
      facilityCity: this.patientData.Facility?.FacilityAddress?.City || null,
      facilityState: this.patientData.Facility?.FacilityAddress?.State || null,
      facilityZip: this.patientData.Facility?.FacilityAddress?.Zip || null,
      medicareNumber: this.patientData.MedicareNumber,
      isAco: `${this.patientData.IsACO ? 1 : 0}`,
      source: this.source,
      updatedPatientId: updatedPatientId
    };
  
    try {
      let result = await connection.execute(updateSql, updateBinds, { autoCommit: true });
  
      // Access the updated patient ID from result.outBinds
      const updatedId = result.outBinds.updatedPatientId[0];  // Extracting the first value from the array
  
      return { success: true, updatedRows: result.rowsAffected, updatedPatientId: updatedId };
    } catch (err) {
      await connection.rollback();
      throw new Error('Error updating patient record: ' + err.message);
    } finally {
      await connection.close();
    }
  }
  
  // Function to insert patient's insurance details
  async insertInsurance(patientId) {

    const insuranceData = this.patientData.Insurance;
    if (!insuranceData || insuranceData.length === 0) return;

    let connection= await this.getConnection();

     // Insert Insurance Information
     const sqlInsurance = `INSERT INTO PATIENT_INSURANCE (
      INSURANCE_ID, INTEGRATED_PATIENT_ID, INSURANCE_SET_ID, COMPANY_NAME, INSURANCE_PRIORITY, POLICY_NUMBER,
      COMPANY_ADDRESS, SUBSCRIBER_ADDRESS, SUBSCRIBER_EMPLOYER_ADDRESS
    ) 
    VALUES (
      PCARESP.SEQ_INSURANCE.NEXTVAL, :integratedPatientId, :insuranceSetId, :companyName, :insurancePriority,
      :policyNumber, :companyAddress, :subscriberAddress, :subscriberEmployerAddress
    )`;

    const insuranceBinds = insuranceData.map(insurance => ({
      integratedPatientId: patientId,
      insuranceSetId: insurance.InsuranceSetID,
      companyName: insurance.CompanyName,
      insurancePriority: insurance.InsurancePriority,
      policyNumber: insurance.PolicyNumber,
      companyAddress: JSON.stringify(insurance.CompanyAddress),
      subscriberAddress: JSON.stringify(insurance.SubscriberAddress),
      subscriberEmployerAddress: JSON.stringify(insurance.SubscriberEmployerAddress)
    }));

    try {
      await connection.executeMany(sqlInsurance, insuranceBinds, { autoCommit: true });
      return true;
    } catch (err) {
      throw new Error('Error inserting insurance records: ' + err.message);
    }finally {
      await connection.close();
    }
  }

  // Function to update patient's insurance details
async updateInsurance(patientId) {

  let connection= await this.getConnection();
  const insuranceData = this.patientData.Insurance;

// Fetch existing insurance records for the patient
const selectInsuranceSql = `SELECT INSURANCE_SET_ID FROM PATIENT_INSURANCE WHERE INTEGRATED_PATIENT_ID = :integratedPatientId`;
const existingInsuranceResult = await connection.execute(selectInsuranceSql, {
  integratedPatientId: patientId
});
console.log(existingInsuranceResult);
const existingInsuranceIds = existingInsuranceResult.rows.map(row => row[0]);
try {
  // Loop through the updated insurance data
  for (const insurance of insuranceData) {
    if (existingInsuranceIds.includes(insurance.InsuranceSetID)) {
      // Update existing insurance record
      const updateSql = `UPDATE PATIENT_INSURANCE SET 
        COMPANY_NAME = :companyName,
        INSURANCE_PRIORITY = :insurancePriority,
        POLICY_NUMBER = :policyNumber,
        COMPANY_ADDRESS = :companyAddress,  
        SUBSCRIBER_ADDRESS = :subscriberAddress,
        SUBSCRIBER_EMPLOYER_ADDRESS = :subscriberEmployerAddress
        WHERE INTEGRATED_PATIENT_ID = :integratedPatientId
        AND INSURANCE_SET_ID = :insuranceSetId`;
      
      await connection.execute(updateSql, {
        integratedPatientId: patientId,
        insuranceSetId: insurance.InsuranceSetID,
        companyName: insurance.CompanyName,
        insurancePriority: insurance.InsurancePriority,
        policyNumber: insurance.PolicyNumber,
        companyAddress: insurance.CompanyAddress ? JSON.stringify(insurance.CompanyAddress) : null,
        subscriberAddress: insurance.SubscriberAddress ? JSON.stringify(insurance.SubscriberAddress) : null,
        subscriberEmployerAddress: insurance.SubscriberEmployerAddress ? JSON.stringify(insurance.SubscriberEmployerAddress) : null
      }, { autoCommit: false });

    } else {

      // Insert new insurance record (if INSURANCE_SET_ID doesn't exist)
      const insertSql = `INSERT INTO PATIENT_INSURANCE (
        INSURANCE_ID, INTEGRATED_PATIENT_ID, INSURANCE_SET_ID, COMPANY_NAME, INSURANCE_PRIORITY, POLICY_NUMBER, 
        COMPANY_ADDRESS, SUBSCRIBER_ADDRESS, SUBSCRIBER_EMPLOYER_ADDRESS
      ) VALUES (
        PCARESP.SEQ_INSURANCE.NEXTVAL, :integratedPatientId, :insuranceSetId, :companyName, :insurancePriority, :policyNumber, 
        :companyAddress, :subscriberAddress, :subscriberEmployerAddress
      )`;

      await connection.execute(insertSql, {
        integratedPatientId: patientId,
        insuranceSetId: insurance.InsuranceSetID,
        companyName: insurance.CompanyName,
        insurancePriority: insurance.InsurancePriority,
        policyNumber: insurance.PolicyNumber,
        companyAddress: insurance.CompanyAddress ? JSON.stringify(insurance.CompanyAddress) : null,
        subscriberAddress: insurance.SubscriberAddress ? JSON.stringify(insurance.SubscriberAddress) : null,
        subscriberEmployerAddress: insurance.SubscriberEmployerAddress ? JSON.stringify(insurance.SubscriberEmployerAddress) : null
      }, { autoCommit: false });
    }
  }

  // Commit after updating/inserting all records
  await connection.commit();
  console.log('Insurance data updated and new records inserted successfully.');
  return true;
} 
catch (err) {
  console.error('Error updating/adding insurance data:', err);
  await connection.rollback();  // Rollback in case of an error
  throw err;
}finally {
  await connection.close();
}
}
  
}



