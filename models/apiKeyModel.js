import oracledb from 'oracledb';

export class ApiKeyManager {

  // Function to get a connection to the database
  async getConnection() {
    try {
      return await oracledb.getConnection();
    } catch (err) {
      console.error('Error establishing database connection:', err);
      throw err;
    }
  }

  // Function to save API Key and return it
  async saveApiKey(clientName, apiKey, description) {
    const connection = await this.getConnection();  

    // Insert API key Information
    const sql = `INSERT INTO API_KEYS (
      API_KEY_ID, 
      CLIENT_NAME, 
      API_KEY, 
      KEY_DESCRIPTION, 
      IS_ACTIVE
    ) 
    VALUES (
      PCARESP.SEQ_CLIENT_API_KEY.NEXTVAL, 
      :clientName, 
      :apiKey, 
      :keyDescription, 
      1  -- Assuming IS_ACTIVE is always 1 when inserting
    ) RETURNING api_key INTO :returnApiKey`;

    const binds = {
      clientName,
      apiKey,
      keyDescription: description || null,
      returnApiKey: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
    };

    try {
      const result = await connection.execute(sql, binds, { autoCommit: true });
      console.log('API key record inserted successfully.');
      return { success: true, client_name: clientName, api_key: result.outBinds.returnApiKey[0] };
    } catch (err) {
      console.error('Error inserting API key record:', err);
      throw err;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Function to retrieve API key by client name
  async getApiKeyByClientName(clientName) {
    const connection = await this.getConnection();  

    // Get API key Information
    const sql = `SELECT API_KEY FROM API_KEYS WHERE CLIENT_NAME = :clientName AND IS_ACTIVE = 1`;

    const binds = { clientName };

    try {
      const result = await connection.execute(sql, binds);  

      if (result.rows.length === 0) {
        console.warn(`No API key found for client: ${clientName}`);
        return { success: false };
      }

      const apiKey = result.rows[0][0];
      return { success: true, api_key: apiKey };
    } catch (err) {
      console.error('Error retrieving API key record:', err);
      throw err;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Function to check if an API key exists
  async getApiKey(apiKey) {
    const connection = await this.getConnection();  

    // Get API key Information
    const sql = `SELECT API_KEY FROM API_KEYS WHERE API_KEY = :apiKey AND IS_ACTIVE = 1`;

    const binds = { apiKey };

    try {
      const result = await connection.execute(sql, binds); 

      if (result.rows.length === 0) {
        return { success: false };
      } else {
        return { success: true };
      }
    } catch (err) {
      console.error('Error retrieving API key record:', err);
      throw err;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}
