import db from '../config/db.js';

// Save a new API key to the database
export const saveApiKey = async (clientName, apiKey) => {
  const query = 'INSERT INTO api_keys (client_name, api_key) VALUES (?, ?)';
  await db.execute(query, [clientName, apiKey]);
};

// Get API key details by API key
export const getApiKey = async (apiKey) => {
  const query = 'SELECT * FROM api_keys WHERE api_key = ?';
  const [rows] = await db.execute(query, [apiKey]);
  return rows;
};

// Check if an API key already exists for a given client name
export const getApiKeyByClientName = async (clientName) => {
  const query = 'SELECT * FROM api_keys WHERE client_name = ?';
  const [rows] = await db.execute(query, [clientName]);
  return rows.length > 0 ? rows[0].api_key : null;
};
