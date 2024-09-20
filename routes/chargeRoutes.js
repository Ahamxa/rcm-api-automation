import express from 'express';
import chargeController from '../controllers/chargeController.js';
import { authenticateAPIKey } from '../middleware/apiKeyAuth.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import chargeSchema from '../validators/chargeValidation.js';

const router = express.Router();

router.post('/charges', authenticateAPIKey,validateRequest(chargeSchema), chargeController.createCharge);

export default router;
