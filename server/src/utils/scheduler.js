import * as passwordResetService from "../services/passwordResetService.js";
import logger from "./logger.js";

// Cleanup expired tokens every hour
export const startTokenCleanup = () => {
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  setInterval(async () => {
    try {
      await passwordResetService.cleanupExpiredTokens();
    } catch (error) {
      logger.error(`Token cleanup failed: ${error.message}`);
    }
  }, CLEANUP_INTERVAL);

  logger.info("Token cleanup scheduler started");
};
