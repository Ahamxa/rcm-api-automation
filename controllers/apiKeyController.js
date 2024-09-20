import crypto from 'crypto';
import { getApiKeyByClientName, saveApiKey } from '../models/apiKeyModel.js';

export const generateApiKey = async (req, res, next) => {
  try {
    const { clientName } = req.body;

    if (!clientName) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    // Check if an API key already exists for the client name
    const existingApiKey = await getApiKeyByClientName(clientName);
    if (existingApiKey) {
      return res.status(400).json({ message: 'API key already exists for this client' });
    }

    // Generate a new API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    await saveApiKey(clientName, apiKey);

    res.status(201).json({ clientName, apiKey });
  } catch (error) {
    next(error);
  }
};
