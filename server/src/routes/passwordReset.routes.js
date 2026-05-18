import express from "express";
const router = express.Router();
import * as passwordResetController from "../controllers/passwordReset.controller.js";
import { rateLimiter } from "../middlewares/rateLimiter.middleware.js";

// Apply rate limiting to prevent abuse
router.post(
  "/request",
  rateLimiter(5, 15),
  passwordResetController.requestReset,
);
router.post("/validate", passwordResetController.validateToken);
router.post("/reset", passwordResetController.resetPassword);

export default router;
