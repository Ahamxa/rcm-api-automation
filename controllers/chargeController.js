import { Charge } from "../models/chargeModel.js";
import { logger } from "../utils/logger.js";

const chargeController = {

  // Create a new charge
  createCharge: async (req, res) => {
    try {
      const { Data, Metadata } = req.body;
      logger.info(`Creating charge with metadata: ${JSON.stringify(Metadata)}`);

      const charge = new Charge();

      // Check if charge already exists
      if (await charge.chargeExists(Data.BillingEvent)) {
        logger.warn(`Charge data already exists for BillingEvent: ${Data.BillingEvent.id}`);
        return res.status(400).json({ success: false, message: 'Charge data already exists' });
      }

      // Insert new charge
      const result = await charge.insert(Data.BillingEvent, Metadata.ApiSender);
      await charge.insertCharges(Data.BillingEvent.Charges, result.id);

      if (result) {
        logger.info(`Charge data saved successfully for BillingEvent ID: ${Data.BillingEvent.id}`);
        return res.status(201).json({ success: true, message: 'Charge data saved successfully', result });
      } else {
        logger.error("Failed to save charge data");
        return res.status(400).json({ success: false, message: 'Failed to save charge data' });
      }
    } catch (error) {
      logger.error(`Error creating charge: ${error.message}`, { stack: error.stack });
      return res.status(500).json({ success: false, message: 'Failed to create charge', error: error.message });
    }
  },
};

export default chargeController;
