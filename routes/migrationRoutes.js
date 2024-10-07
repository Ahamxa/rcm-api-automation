import express from 'express';
import { logger } from '../utils/logger.js';
import migrationController from '../controllers/migrationController.js';

const router = express.Router();

router.post('/migrate-patients', async (req, res) => {
    try {
        // Log request body to see the data coming in
        logger.info(`POST /migrate-patients`);

        await migrationController.migratePatient(req,res);
    
    } catch (error) {
        logger.error(`Error Migrating patient: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
