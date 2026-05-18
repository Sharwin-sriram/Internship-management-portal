const passwordResetService = require('../services/passwordReset.service');
const logger = require('./logger');

// Cleanup expired tokens every hour
const startTokenCleanup = () => {
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  setInterval(async () => {
    try {
      await passwordResetService.cleanupExpiredTokens();
    } catch (error) {
      logger.error(`Token cleanup failed: ${error.message}`);
    }
  }, CLEANUP_INTERVAL);

  logger.info('Token cleanup scheduler started');
};

module.exports = { startTokenCleanup };
