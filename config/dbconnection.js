import oracledb from 'oracledb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Oracle DB connection
export const connectDB = async () => {
  try {
   await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 10,
      poolMax: 20,
      poolIncrement: 5,
      queueTimeout: 60000,
      poolTimeout: 60,
    });
    console.log('OracleDB connected successfully!');

  } catch (err) {
    console.error('Database connection error:', err);

    process.exit(1);
  }
};

