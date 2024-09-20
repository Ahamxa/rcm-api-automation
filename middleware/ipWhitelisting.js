// middleware/ipWhitelisting.js
const allowedIps = [
    '127.0.0.1',  // Localhost IPv4
    '::1',        // Localhost IPv6
    '192.168.1.0/24', // Local network range (adjust as needed)
  ];

export const ipWhitelist = (req, res, next) => {

  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!allowedIps.includes(clientIp)) {
    return res.status(403).json({ message: 'Forbidden: Access is denied' });
  }

  next();
};
