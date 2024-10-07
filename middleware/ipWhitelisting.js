import ipRangeCheck from 'ip-range-check';

const allowedIps = [
  '127.0.0.1',  // Localhost IPv4
  '::1',        // Localhost IPv6
  '192.168.88.0/24', // Local network range (adjust as needed)
];

export const ipWhitelist = (req, res, next) => {
  const forwardedHeader = req.headers['x-forwarded-for'];
  // Use first IP from the list if multiple are present
  const clientIp = forwardedHeader ? forwardedHeader.split(',')[0].trim() : req.connection.remoteAddress;

  console.log(`Client IP: ${clientIp}`);  // Log the client IP for debugging purposes

  // Check if client IP is in the allowed list or within allowed ranges
  if (!ipRangeCheck(clientIp, allowedIps)) {
    return res.status(403).json({ message: 'Forbidden: Access is denied' });
  }

  next();
};
