const logger = require('../utils/logger');

// Simple in-memory rate limiter
const requestCounts = new Map();

exports.rateLimiter = (maxRequests = 5, windowMinutes = 15) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, []);
    }

    const requests = requestCounts.get(identifier);
    
    // Remove old requests outside the time window
    const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      logger.warn(`Rate limit exceeded for IP: ${identifier}`);
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    recentRequests.push(now);
    requestCounts.set(identifier, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, timestamps] of requestCounts.entries()) {
        const recent = timestamps.filter(t => now - t < windowMs);
        if (recent.length === 0) {
          requestCounts.delete(key);
        } else {
          requestCounts.set(key, recent);
        }
      }
    }

    next();
  };
};
