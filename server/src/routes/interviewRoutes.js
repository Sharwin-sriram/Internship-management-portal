import express from "express";
import {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterviewStatus,
  completeInterview,
  rescheduleInterviewCompany,
  acceptInterview,
  declineInterview,
  requestReschedule,
  advanceRound,
  getRoundHistory,
  submitFeedback,
  getFeedback,
  releaseFeedback,
  syncCalendar,
} from "../controllers/interviewController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  scheduleInterviewRules,
  interviewIdParam,
  rescheduleRules,
  companyRescheduleRules,
  statusUpdateRules,
  feedbackRules,
  advanceRoundRules,
  handleValidationErrors,
} from "../middlewares/interviewValidation.middleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(asyncHandler(getInterviews))
  .post(
    authorize("company", "coordinator", "admin"),
    scheduleInterviewRules,
    handleValidationErrors,
    asyncHandler(scheduleInterview),
  );

router.get(
  "/application/:applicationId/rounds",
  authorize("company", "coordinator", "admin", "student"),
  asyncHandler(getRoundHistory),
);

router
  .route("/:id")
  .get(interviewIdParam, handleValidationErrors, asyncHandler(getInterviewById));

router.patch(
  "/:id/status",
  statusUpdateRules,
  handleValidationErrors,
  asyncHandler(updateInterviewStatus),
);

router.post(
  "/:id/complete",
  authorize("company", "coordinator", "admin"),
  interviewIdParam,
  handleValidationErrors,
  asyncHandler(completeInterview),
);

router.post(
  "/:id/accept",
  authorize("student"),
  interviewIdParam,
  handleValidationErrors,
  asyncHandler(acceptInterview),
);

router.post(
  "/:id/decline",
  authorize("student"),
  interviewIdParam,
  handleValidationErrors,
  asyncHandler(declineInterview),
);

router.patch(
  "/:id/reschedule",
  authorize("student"),
  rescheduleRules,
  handleValidationErrors,
  asyncHandler(requestReschedule),
);

router.patch(
  "/:id/reschedule-company",
  authorize("company", "coordinator", "admin"),
  companyRescheduleRules,
  handleValidationErrors,
  asyncHandler(rescheduleInterviewCompany),
);

router.post(
  "/:id/advance-round",
  authorize("company", "coordinator", "admin"),
  advanceRoundRules,
  handleValidationErrors,
  asyncHandler(advanceRound),
);

router
  .route("/:id/feedback")
  .get(
    interviewIdParam,
    handleValidationErrors,
    asyncHandler(getFeedback),
  )
  .post(
    authorize("interviewer", "company", "coordinator", "admin"),
    feedbackRules,
    handleValidationErrors,
    asyncHandler(submitFeedback),
  );

router.patch(
  "/:id/feedback/release",
  authorize("coordinator", "admin"),
  interviewIdParam,
  handleValidationErrors,
  asyncHandler(releaseFeedback),
);

router.post(
  "/:id/calendar/sync",
  authorize("company", "coordinator", "admin"),
  interviewIdParam,
  handleValidationErrors,
  asyncHandler(syncCalendar),
);

export default router;
