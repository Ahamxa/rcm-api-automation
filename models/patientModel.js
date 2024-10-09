
import oracledb from 'oracledb';
import { logger } from '../utils/logger.js';

export class Patient {

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

  async patientExists() {
    const connection = await this.getConnection();
    const checkSql = `SELECT COUNT(*) AS COUNT FROM INTEGRATED_PATIENT WHERE EXTERNAL_PATIENT_ID = :externalPatientId`;
    
    try {
      const result = await connection.execute(checkSql, { externalPatientId: this.patientData.PatientID });
      return result.rows[0][0] > 0;
    } catch (err) {
      throw new Error('Error checking patient existence: ' + err.message);
    } finally {
      await connection.close();
    }
  }

  async migrateData(patientId) {
    const connection = await this.getConnection();
    
    try {
      const result = await connection.execute(
        `
        DECLARE
            v_flag NUMBER;
        BEGIN
            wrapper_upsert_patient(
                p_temp_patient_id => :p_temp_patient_id,
                p_op_flag => :v_flag
            );
        END;
        `,
        {
          p_temp_patient_id: patientId,
          v_flag: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT}
        },{ autoCommit: true }
      );
  
      const flag = result.outBinds.v_flag;
      if(flag==1){
        logger.info(`patient migrated with internal id: ${JSON.stringify(patientId)}`);
      }else{
        logger.info(`migration failed for patient with internal id: ${JSON.stringify(patientId)}`);
      }
    } catch (err) {
      throw new Error('Error migrating patient existence: ' + err.message);
    } finally {
      await connection.close();
    }
  }


   // Function to insert a new patient record
   async insertPatient() {

    let connection=await this.getConnection();

    const insertSql = `INSERT INTO INTEGRATED_PATIENT (
      INTEGRATED_PATIENT_ID, EXTERNAL_PATIENT_ID, PATIENT_EVENT_ID, PATIENT_STATUS, PATIENT_FIRST, PATIENT_MIDDLE, PATIENT_LAST, PATIENT_DOB, PATIENT_SSN,
      PATIENT_GENDER, PATIENT_ADDRESS_LINE1, PATIENT_ADDRESS_LINE2, PATIENT_CITY, PATIENT_STATE, PATIENT_ZIP, PATIENT_PHONE, PATIENT_MOBILE_PHONE, PATIENT_FLOOR,
      PATIENT_ROOM, PATIENT_ADMIT_DATE, FACILITY_NAME, PLACE_OF_SERVICE_CODE, FACILITY_NPI, FACILITY_EXTERNAL_ID, FACILITY_ADDRESS_LINE1, FACILITY_ADDRESS_LINE2,
      FACILITY_CITY, FACILITY_STATE, FACILITY_ZIP, MEDICARE_NUMBER, IS_ACO, SOURCE                        
    ) 
    VALUES (
      PCARESP.SEQ_INTEGRATED_PATIENT.NEXTVAL, :externalPatientId, :patientEventId, :patientStatus, :patientFirst, :patientMiddle, :patientLast, 
      TO_DATE(:patientDob, 'YYYY-MM-DD'), :patientSsn, :patientGender, :patientAddressLine1, :patientAddressLine2, :patientCity, :patientState, :patientZip, 
      :patientPhone, :patientMobilePhone, :patientFloor, :patientRoom,  TO_DATE(:patientAdmitDate, 'YYYY-MM-DD'), :facilityName, :placeOfServiceCode, 
      :facilityNpi, :facilityExternalId, :facilityAddressLine1, :facilityAddressLine2, :facilityCity, :facilityState, :facilityZip, :medicareNumber, 
      :isAco,:source
    ) 
    RETURNING INTEGRATED_PATIENT_ID INTO :incomingPatientId`;

    const insertBinds = {
      incomingPatientId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      externalPatientId: this.patientData.PatientID,
      patientEventId: this.patientData.PatientEventID || null,
      patientStatus: this.patientData.PatientStatus || null,
      patientFirst: this.patientData.PatientFirst,
      patientMiddle: this.patientData.PatientMiddle || null,
      patientLast: this.patientData.PatientLast || null,
      patientDob: this.patientData.PatientDOB || null,
      patientSsn: this.patientData.PatientSSN || null,
      patientGender: this.patientData.PatientGender || null,
      patientAddressLine1: this.patientData.PatientAddress?.AddressLine1 || null,
      patientAddressLine2: this.patientData.PatientAddress?.AddressLine2 || null,
      patientCity: this.patientData.PatientAddress?.City || null,
      patientState: this.patientData.PatientAddress?.State || null,
      patientZip: this.patientData.PatientAddress?.Zip || null,
      patientPhone: this.patientData.PatientPhone,
      patientMobilePhone: this.patientData.PatientMobilePhone || null,
      patientFloor: this.patientData.PatientFloor || null,
      patientRoom: this.patientData.PatientRoom || null,
      patientAdmitDate: this.patientData.PatientAdmitDate ? this.patientData.PatientAdmitDate.split('T')[0] : null,
      facilityName: this.patientData.Facility?.FacilityName || null,
      placeOfServiceCode: this.patientData.Facility?.PlaceOfServiceCode || null,
      facilityNpi: this.patientData.Facility?.NPI || null,
      facilityExternalId: this.patientData.Facility?.ExternalID || null,
      facilityAddressLine1: this.patientData.Facility?.FacilityAddress?.AddressLine1 || null,
      facilityAddressLine2: this.patientData.Facility?.FacilityAddress?.AddressLine2 || null,
      facilityCity: this.patientData.Facility?.FacilityAddress?.City || null,
      facilityState: this.patientData.Facility?.FacilityAddress?.State || null,
      facilityZip: this.patientData.Facility?.FacilityAddress?.Zip || null,
      medicareNumber: this.patientData.MedicareNumber || null,
      isAco: `${this.patientData.IsACO ? 1 : 0}` || null,
      source:this.source
    };

    


    try {

      //insert in temp tables
      const result = await connection.execute(insertSql, insertBinds, { autoCommit: true });

      logger.info(`patient created with internal id: ${JSON.stringify(result.outBinds.incomingPatientId[0])}`);

      //migrate data 

      await this.migrateData(result.outBinds.incomingPatientId[0] )

      return { success: true, id: result.outBinds.incomingPatientId[0] };
    } catch (err) {
      throw new Error('Error inserting patient record: ' + err.message);
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
      patientEventId: this.patientData.PatientEventID || null,
      patientStatus: this.patientData.PatientStatus || null,
      patientFirst: this.patientData.PatientFirst || null,
      patientMiddle: this.patientData.PatientMiddle || null,
      patientLast: this.patientData.PatientLast || null,
      patientDob: this.patientData.PatientDOB || null,
      patientSsn: this.patientData.PatientSSN || null,
      patientGender: this.patientData.PatientGender || null,
      patientAddressLine1: this.patientData.PatientAddress?.AddressLine1 || null,
      patientAddressLine2: this.patientData.PatientAddress?.AddressLine2 || null,
      patientCity: this.patientData.PatientAddress?.City || null,
      patientState: this.patientData.PatientAddress?.State || null,
      patientZip: this.patientData.PatientAddress?.Zip || null,
      patientPhone: this.patientData.PatientPhone || null,
      patientMobilePhone: this.patientData.PatientMobilePhone || null,
      patientFloor: this.patientData.PatientFloor || null,
      patientRoom: this.patientData.PatientRoom || null,
      patientAdmitDate: this.patientData.PatientAdmitDate ? this.patientData.PatientAdmitDate.split('T')[0] : null,
      facilityName: this.patientData.Facility?.FacilityName || null,
      placeOfServiceCode: this.patientData.Facility?.PlaceOfServiceCode || null,
      facilityNpi: this.patientData.Facility?.NPI || null,
      facilityExternalId: this.patientData.Facility?.ExternalID || null,
      facilityAddressLine1: this.patientData.Facility?.FacilityAddress?.AddressLine1 || null,
      facilityAddressLine2: this.patientData.Facility?.FacilityAddress?.AddressLine2 || null,
      facilityCity: this.patientData.Facility?.FacilityAddress?.City || null,
      facilityState: this.patientData.Facility?.FacilityAddress?.State || null,
      facilityZip: this.patientData.Facility?.FacilityAddress?.Zip || null,
      medicareNumber: this.patientData.MedicareNumber || null,
      isAco: `${this.patientData.IsACO ? 1 : 0}` || null,
      source: this.source,
      updatedPatientId: updatedPatientId
    };
  
    try {
      let result = await connection.execute(updateSql, updateBinds, { autoCommit: true });
  
      // Access the updated patient ID from result.outBinds
      const updatedId = result.outBinds.updatedPatientId[0];
      logger.info(`patient updated with  internal id: ${JSON.stringify(result.outBinds.updatedPatientId[0])}`);

      //migrate data
      this.migrateData(updatedId);
  
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
    if (!insuranceData || insuranceData.length === 0) return true;

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
      companyName: insurance.CompanyName || null,
      insurancePriority: insurance.InsurancePriority,
      policyNumber: insurance.PolicyNumber,
      companyAddress: insurance.CompanyAddress ? JSON.stringify(insurance.CompanyAddress) : null,
      subscriberAddress: insurance.SubscriberAddress ? JSON.stringify(insurance.SubscriberAddress) : null,
      subscriberEmployerAddress: insurance.SubscriberEmployerAddress ? JSON.stringify(insurance.SubscriberEmployerAddress) : null
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
        companyName: insurance.CompanyName || null,
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



