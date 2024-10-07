import express from 'express';
import chargeController from '../controllers/chargeController.js';
import { authenticateAPIKey } from '../middleware/apiKeyAuth.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import chargeSchema from '../validators/chargeValidation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/charges', authenticateAPIKey, validateRequest(chargeSchema), async (req, res) => {
    try {
        
        await chargeController.createCharge(req, res);
    } catch (error) {
        logger.error(`Error creating charge: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
