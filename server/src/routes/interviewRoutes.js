import express from "express";
import {
  createInterview,
  getInterviews,
  updateInterviewStatus,
  submitFeedback,
} from "../controllers/interviewController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Apply auth middleware to all interview routes
router.use(protect);

router
  .route("/")
  .get(getInterviews)
  .post(authorize("company", "coordinator", "admin"), createInterview);

router
  .route("/:id/status")
  .patch(updateInterviewStatus);

router
  .route("/:id/feedback")
  .post(authorize("interviewer", "company", "coordinator", "admin"), submitFeedback);

export default router;
