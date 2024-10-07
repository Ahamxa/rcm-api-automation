import { connectDB } from "./config/dbconnection";


let language={
    "LanguageName": "English",
    "Code_639_1": "en",
    "Code_639_2": "eng"
}


  // Function to insertlanguage
  let a=async (language)=> {

    let connection= await this.getConnection();
  
  // Fetch existing language records for the patient
  const Sql = `SELECT PRIMARY_LANGUAGE_ID FROM REG_PRIMARY_LANGUAGE WHERE LANGUAGE_CODE = :lanCode1 OR LANGUAGE_CODE = :langCode2`;

   // Define the bind variables (input and output parameters)
   const bindParams = {
    ip_practice_id: 261, // Example input value
    ip_primary_provider: null,
    ip_patient_physician: null,
    ip_patient_type: null,
    ip_lname: this.patientData.PatientLast,
    ip_fname: this.patientData.PatientFirst,
    ip_minitial: null,
    ip_mlname: null,
    ip_mfname: null,
    ip_mminitial: null,
    ip_title: null,
    ip_address: this.patientData.PatientAddress?.AddressLine1 || null,
    ip_city: this.patientData.PatientAddress?.City || null,
    ip_state: this.patientData.PatientAddress?.State || null,
    ip_zip: this.patientData.PatientAddress?.Zip || null,
    ip_extzip: null,
    ip_sex: this.patientData.PatientGender,
    ip_mstatus: null,
    ip_occupation: null,
    ip_ssn: this.patientData.PatientSSN,
    ip_mname: null,
    ip_dob: this.patientData.PatientDOB,
    ip_hphone: this.patientData.PatientPhone,
    ip_wphone: this.patientData.PatientPhone,
    ip_wphone_ext: null,
    ip_fax: null,
    ip_cell: this.patientData.PatientMobilePhone,
    ip_email: null,
    ip_religion: null,
    ip_country: null,
    ip_empstat: null,
    ip_employer: null,
    ip_tor: null,
    ip_primlang: null,
    ip_race: null,
    ip_ethnicity: null,
    ip_prefered_contact: null,
    ip_remarks: null,
    ip_death_date: null,
    ip_patient_notes: null,
    ip_pnt: null,
    ip_report_exempt: null,
    ip_user_id: null,
    ip_user_ip: null,
    ip_phymast_id: null,
    ip_surname: null,
    ip_scan_image_id: null,
    ip_patientlogin: null,
    ip_patientpassword: null,
    ip_deathcause: null,
    ip_pcp_f: null,
    ip_ref_phy: null,
    ip_other_phy: null,
    ip_reference_source: null,
    ip_health_info_req_f: null,
    ip_name_type: null,
    ip_mothersurname: null,
    ip_default_contact: null,
    ip_other_phone: null,
    ip_tel_code: null,
    ip_tel_equ_code: null,
    ip_dnp: null,
    ip_user_note: null,
    ip_dnp_rsn_id: null,
    ip_shoe_size: null, 
    // Output parameters
    op_account_number: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    op_patient_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    op_pat_name: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    op_race: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
  };

  console.log(bindParams);
  
  try {
    const existingLanguageResult = await connection.execute(Sql, {
        lanCode1: language.Code_639_1,
        lanCode2:language.Code_639_1
      });


      //insert in actual tables
      // Execute the stored procedure
    const result1 = await connection.execute(
        `BEGIN PRST_REG_P_MGMT.insert_patient(
          :ip_practice_id, :ip_primary_provider, :ip_patient_physician, :ip_patient_type,
          :ip_lname, :ip_fname, :ip_minitial, :ip_mlname, :ip_mfname, :ip_mminitial,
          :ip_title, :ip_address, :ip_city, :ip_state, :ip_zip, :ip_extzip,
          :ip_sex, :ip_mstatus, :ip_occupation, :ip_ssn, :ip_mname, TO_DATE(:ip_dob, 'YYYY-MM-DD'),
          :ip_hphone, :ip_wphone, :ip_wphone_ext, :ip_fax, :ip_cell, :ip_email,
          :ip_religion, :ip_country, :ip_empstat, :ip_employer, :ip_tor, :ip_primlang,
          :ip_race, :ip_ethnicity, :ip_prefered_contact, :ip_remarks, :ip_death_date,
          :ip_patient_notes, :ip_pnt, :ip_report_exempt, :ip_user_id, :ip_user_ip,
          :ip_phymast_id, :ip_surname, :ip_scan_image_id, :ip_patientlogin, :ip_patientpassword,
          :ip_deathcause, :ip_pcp_f, :ip_ref_phy, :ip_other_phy, :ip_reference_source,
          :ip_health_info_req_f, :ip_name_type, :ip_mothersurname, :ip_default_contact, 
          :ip_other_phone, :ip_tel_code, :ip_tel_equ_code, :ip_dnp, :ip_user_note, 
          :ip_dnp_rsn_id, :ip_shoe_size, :op_account_number, :op_patient_id, :op_pat_name, :op_race
        ); END;`,
        bindParams, { autoCommit: true })
   
  
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