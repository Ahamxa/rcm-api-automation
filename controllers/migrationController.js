import { MigrationService } from "../services/MigrationService.js";
import { logger } from "../utils/logger.js";

const migrationController = {


    
  
  migratePatient: async (req, res) => {
    try {

      logger.info(`Migrating patient with metadata`);

      let ms= new MigrationService();

      await ms.migratePatient();

      logger.info(`Patient data and insurance Migrated`);
      return res.status(200).json({ success: true, message: "Patient data and insurance Migrated successfully"});

    //   let patient = new Patient(data, metaData.ApiSender);
  
    //   // Check if patient exists
    //   const patientExists = await patient.patientExists();
    //   if (patientExists) {
    //     // Update patient
    //     const updateResult = await patient.updatePatient();
        
    //     if (updateResult.success) {
    //       // Update insurance after updating patient
    //       await patient.updateInsurance(updateResult.updatedPatientId);
    //       logger.info(`Patient updated successfully for ID: ${data.PatientID} Rows affected: ${updateResult.updatedRows}`);
    //       return res.status(201).json({ success: true, message: "Patient updated successfully" });
    //     }
    //     logger.error(`Failed to update patient with ID: ${data.PatientID}`);
    //     return res.status(400).json({ success: false, message: "Failed to update patient" });
    //   } 
  
    //   // Insert patient if not exists
    //   const insertResult = await patient.insertPatient();


    //   if (!insertResult.success) {
    //     logger.error(`Failed to insert patient: ${insertResult.message}`);
    //     return res.status(400).json({ success: false, message: insertResult.message });
    //   }
  
    //   // Insert insurance after successful patient insertion
    //   const insuranceResult = await patient.insertInsurance(insertResult.id);
    //   if (insuranceResult) {
    //     logger.info(`Patient data and insurance saved successfully for ID: ${insertResult.id}`);
    //     return res.status(201).json({ success: true, message: "Patient data saved successfully", id: insertResult.id });
    //   }
  
    //   logger.error("Failed to insert insurance after patient creation");
    //   return res.status(400).json({ success: false, message: "Failed to insert insurance" });

    } catch (error) {
      logger.error(`Error Migrating patient: ${error.message}`, { stack: error.stack });
      return res.status(500).json({ success: false, message: 'Failed to Migrating patient', error: error.message });
    }
  },
};

export default migrationController;
