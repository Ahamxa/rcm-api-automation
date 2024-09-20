import express from 'express';
import dotenv from 'dotenv';
import apiKeyRoutes from './routes/apiKey.js';
import patientRoutes from './routes/patientRoutes.js';
import chargeRoutes from './routes/chargeRoutes.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', apiKeyRoutes);
app.use('/api', patientRoutes);
app.use('/api', chargeRoutes);

app.get('/ipaddress', (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.send(`Your IP address is ${ipAddress}`);
});



const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
