import express from 'express';
import { generateApiKey } from '../controllers/apiKeyController.js';
import { ipWhitelist } from '../middleware/ipWhitelisting.js';

const router = express.Router();

router.post('/generate-api-key',ipWhitelist, generateApiKey);

export default router;
