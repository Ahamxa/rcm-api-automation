import oracledb from 'oracledb';

const config = {
  user: 'pcaresp',           
  password: 'pcaresp',        
  connectString: '192.168.88.80:1521/pcarespdb',  
};

const checkConnectionAndListTables = async () => {
  let connection;

  try {
   
    connection = await oracledb.getConnection(config);
    console.log('Connected to Oracle Database!');

  
    const result = await connection.execute(`
      SELECT table_name FROM user_tables
    `);

   
    console.log('Tables in the database:', result.rows);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();  
        console.log('Connection closed');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
};


checkConnectionAndListTables ();