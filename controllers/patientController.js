import { Patient } from "../models/patientModel.js";
import { logger } from "../utils/logger.js";

const patientController = {

  // Create a new patient
  createPatient: async (req, res) => {
    try {
      const data = req.body.Data.Patient; 
      const metaData = req.body.Metadata;

      let patient = new Patient(data, metaData.ApiSender);
  
      // Check if patient exists
      const patientExists = await patient.patientExists();
      if (patientExists) {
        // Update patient
        logger.info(`Updating patient with metadata: ${JSON.stringify(metaData)}`);
        const updateResult = await patient.updatePatient();
        
        if (updateResult.success) {
          // Update insurance after updating patient
          await patient.updateInsurance(updateResult.updatedPatientId);
          logger.info(`Patient updated successfully for external ID: ${data.PatientID}`);
          return res.status(201).json({ success: true, message: "Patient updated successfully" });
        }
        logger.error(`Failed to update patient with ID: ${data.PatientID}`);
        return res.status(400).json({ success: false, message: "Failed to update patient" });
      } 
  
      // Insert patient if not exists
      logger.info(`Creating patient with metadata: ${JSON.stringify(metaData)}`);
      const insertResult = await patient.insertPatient();

      if (!insertResult.success) {
        logger.error(`Failed to insert patient: ${insertResult.message}`);
        return res.status(400).json({ success: false, message: insertResult.message });
      }
  
      // Insert insurance after successful patient insertion
      const insuranceResult = await patient.insertInsurance(insertResult.id);
      if (insuranceResult) {
        logger.info(`Patient data and insurance saved successfully for ID: ${insertResult.id}`);
        return res.status(201).json({ success: true, message: "Patient data saved successfully", id: insertResult.id});
      }
  
      logger.error("Failed to insert insurance after patient creation");
      return res.status(400).json({ success: false, message: "Failed to insert insurance" });

    } catch (error) {
      logger.error(`Error creating patient: ${error.message}`, { stack: error.stack });
      return res.status(500).json({ success: false, message: 'Failed to create patient', error: error.message });
    }
  },
};

export default patientController;
