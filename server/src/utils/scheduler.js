import * as passwordResetService from "../services/passwordResetService.js";
import { processInterviewReminders } from "../services/interviewReminderService.js";
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

/** Interview reminders — runs every 15 minutes */
export const startInterviewReminderScheduler = () => {
  const REMINDER_INTERVAL = 15 * 60 * 1000;

  setInterval(async () => {
    try {
      await processInterviewReminders();
    } catch (error) {
      logger.error(`Interview reminder job failed: ${error.message}`);
    }
  }, REMINDER_INTERVAL);

  processInterviewReminders().catch((err) =>
    logger.error(`Initial interview reminder run failed: ${err.message}`),
  );

  logger.info("Interview reminder scheduler started (every 15 min)");
};
