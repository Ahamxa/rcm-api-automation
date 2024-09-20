import express from 'express';
import patientController from '../controllers/patientController.js';
import { authenticateAPIKey } from '../middleware/apiKeyAuth.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import patientSchema from '../validators/patientValidation.js';

const router = express.Router();

router.post('/patients', authenticateAPIKey,validateRequest(patientSchema), patientController.createPatient);

export default router;
