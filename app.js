import express from 'express'; 
import dotenv from 'dotenv';
import apiKeyRoutes from './routes/apiKey.js';
import patientRoutes from './routes/patientRoutes.js';
import chargeRoutes from './routes/chargeRoutes.js';
import migrationRoutes from './routes/migrationRoutes.js';
import { logger } from './utils/logger.js';
import { connectDB } from './config/dbconnection.js';

dotenv.config();

const app = express();
app.use(express.json());

// Global variable for logging incoming requests and responses
const logRequestResponse = (req, res, next) => {
  const startTime = new Date();
  
  const st=new Date();
  // Log the request details
  logger.info(`Incoming Request: ${req.method} ${req.url}, Time: ${startTime.toISOString()}, Body: ${JSON.stringify(req.body)}`);

  res.on('finish', () => {
    const endTime = new Date();
    const duration = endTime - startTime;

    // Log the response details
    logger.info(`Response: ${res.statusCode} ${res.statusMessage}; Time: ${endTime.toISOString()}, Duration: ${duration}ms`);
  });
  
  next();
};

app.use(logRequestResponse);

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message || err}`);
  res.status(500).json({ message: 'Internal Server Error' });
};

// API routes
app.use('/api', apiKeyRoutes);
app.use('/api', patientRoutes);
app.use('/api', chargeRoutes);
app.use('/api', migrationRoutes);

app.get('/ipaddress', (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.send(`Your IP address is ${ipAddress}`);
});

app.get('/version', (req, res) => {
  res.send(`RCM API AUTOMATION VERSION ${process.env.VERSION}`);
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route Not Found' });
});

// Use the error handling middleware
app.use(errorHandler);

// Server startup and database connection
const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    logger.error('Failed to connect to the database:', err);
    process.exit(1); // Exit with failure if DB connection fails
  });

// Graceful shutdown on unexpected errors or signals
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // Optionally, shut down server after cleanup
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('Server is shutting down...');
  process.exit(0);
});


process.on('SIGTERM', () => {
  logger.info('Server received termination signal, shutting down gracefully...');
  process.exit(0);
});
