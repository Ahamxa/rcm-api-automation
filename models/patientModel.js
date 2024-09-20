// models/patientModel.js
import db from '../config/db.js';

export const createPatient=async (patientData) =>{

  console.log(patientData);
  return true;

    // // Save patient data
    // const patientID = await savePatient(patientData);

    // // Save facility data
    // const facilityID = await saveFacility(patientData.Facility);

  
}


const savePatient=async (patient) =>{

  // Save patient address
  const PatientAddressID = await saveAddress(patient.PatientAddress);

//save patient data
  const query = `INSERT INTO patients (PatientID, PatientStatus,  PatientFirst, PatientMiddle, PatientLast, 
  PatientDOB, PatientSSN, PatientGender, PatientPhone, PatientMobilePhone, PatientFloor,PatientRoom,
   PatientAdmitDate, MedicareNumber,PatientAddressID )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`;

  const values = [
        patient.PatientID,
        patient.PatientStatus,
        patient.PatientFirst,
        patient.PatientMiddle,
        patient.PatientLast,
        patient.PatientDOB,
        patient.PatientSSN,
        patient.PatientGender,
        patient.PatientPhone,
        patient.PatientMobilePhone,
        patient.PatientFloor,
        patient.PatientRoom,
        patient.PatientAdmitDate,
        patient.MedicareNumber,
        PatientAddressID 
    ];

  try {
    const [result] = await db.execute(query, values);
    return result;
  } catch (err) {
    console.error('Error inserting patient:', err);
    throw err;
  }
}

// Function to insert data into addresses table
async function saveAddress(address) {
  const query = `INSERT INTO addresses (AddressLine1, AddressLine2, City, State, Zip)
                 VALUES (?, ?, ?, ?, ?)`;
  const values = [
    address.AddressLine1,
    address.AddressLine2 || null,
    address.City,
    address.State,
    address.Zip
  ];

  try {
    const [result] = await db.execute(query, values);
    return result.insertId; // Return the address ID for linking
  } catch (err) {
    console.error('Error inserting address:', err);
  }
}


// Function to insert data into facilities table
async function saveFacility(facility) {
  const facilityAddressID = await saveAddress(facility.FacilityAddress);

  const query = `INSERT INTO facilities (FacilityName, PlaceOfServiceCode, NPI, ExternalID, FacilityAddressID)
                 VALUES (?, ?, ?, ?, ?)`;
  const values = [
    facility.FacilityName,
    facility.PlaceOfServiceCode,
    facility.NPI,
    facility.ExternalID,
    facilityAddressID
  ];

  try {
    const [result] = await db.execute(query, values);
    return result.insertId;
  } catch (err) {
    console.error('Error inserting facility:', err);
  }
}


// Function to insert insurance data
async function saveInsurance(patientID, insurance) {
  const query = `INSERT INTO insurances (PatientID, InsuranceSetID, CompanyName, InsurancePriority, PolicyNumber)
                 VALUES (?, ?, ?, ?, ?)`;
  const values = [
    patientID,
    insurance.InsuranceSetID,
    insurance.CompanyName,
    insurance.InsurancePriority,
    insurance.PolicyNumber
  ];

  try {
    await db.execute(query, values);
  } catch (err) {
    console.error('Error inserting insurance:', err);
  }
}

