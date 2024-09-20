import { getApiKey } from '../models/apiKeyModel.js';

export const authenticateAPIKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(403).json({ message: 'Forbidden: No API Key Provided' });
  }

  const [validKey] = await getApiKey(apiKey);

  if (!validKey) {
    return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
  }

  next();
};
