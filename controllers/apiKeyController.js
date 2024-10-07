import crypto from 'crypto';
import { ApiKeyManager } from '../models/apiKeyModel.js';
import { logger } from '../utils/logger.js';

export const generateApiKey = async (req, res, next) => {
  try {
    const { clientName } = req.body;

    if (!clientName) {
      logger.warn("Client name not provided in API key generation request");
      return res.status(400).json({ message: 'Client name is required' });
    }

    const apiKeyManager = new ApiKeyManager();

    // Check if API key already exists
    const existingApiKey = await apiKeyManager.getApiKeyByClientName(clientName);
    if (existingApiKey.success) {
      logger.info(`API key already exists for client: ${clientName}`);
      return res.status(403).json({ message: 'API key already exists for this client', apiKey: existingApiKey.api_key });
    }

    // Generate a new API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    const result = await apiKeyManager.saveApiKey(clientName, apiKey);

    if (result.success) {
      logger.info(`API key created successfully for client: ${clientName}`);
      return res.status(201).json({ message: 'API key created successfully', client_name: result.client_name, apiKey: result.api_key });
    } else {
      logger.error("Error creating API key");
      return res.status(400).json({ message: 'Error creating API key' });
    }

  } catch (error) {
    logger.error(`Error generating API key: ${error.message}`, { stack: error.stack });
    next(error);
  }
};
