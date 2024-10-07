import express from 'express';
import { generateApiKey } from '../controllers/apiKeyController.js';
import { ipWhitelist } from '../middleware/ipWhitelisting.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/generate-api-key', ipWhitelist, async (req, res) => {
    try {
        // Log request IP to track request origins
        logger.info(`POST /generate-api-key - IP: ${req.ip}`);
        
        await generateApiKey(req, res);
    } catch (error) {
        logger.error(`Error generating API key: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
