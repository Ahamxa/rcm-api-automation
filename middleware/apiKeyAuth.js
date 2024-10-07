import { ApiKeyManager } from '../models/apiKeyModel.js';

export const authenticateAPIKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(403).json({ message: 'Forbidden: No API Key Provided' });
  }

  const apikm=new ApiKeyManager();

  const {success} = await apikm.getApiKey(apiKey);

  if (!success) {
    return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
  }

  next();
};
