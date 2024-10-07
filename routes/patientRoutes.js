import express from 'express';
import patientController from '../controllers/patientController.js';
import { authenticateAPIKey } from '../middleware/apiKeyAuth.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import patientSchema from '../validators/patientValidation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/patients', authenticateAPIKey, validateRequest(patientSchema), async (req, res) => {
    try {
        await patientController.createPatient(req, res);
    } catch (error) {
        logger.error(`Error creating patient: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
