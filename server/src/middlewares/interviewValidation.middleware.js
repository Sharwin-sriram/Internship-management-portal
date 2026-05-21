import { body, param, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

export const scheduleInterviewRules = [
  body("application_id")
    .optional()
    .isMongoId()
    .withMessage("application_id must be a valid ID"),
  body("application")
    .optional()
    .isMongoId()
    .withMessage("application must be a valid ID"),
  body("interviewer_id").optional().isMongoId(),
  body("interview_type")
    .isIn(["phone", "video", "in-person"])
    .withMessage("interview_type must be phone, video, or in-person"),
  body("type")
    .optional()
    .isIn(["phone", "video", "in-person", "technical", "hr", "managerial", "assignment"]),
  body("scheduled_at").optional().isISO8601(),
  body("interview_date").optional().isISO8601(),
  body("interview_time").optional().isString(),
  body("date").optional().isISO8601(),
  body("time").optional().isString(),
  body("meeting_link").optional().isString().isLength({ max: 500 }),
  body("instructions").optional().isString().isLength({ max: 2000 }),
  body("round_number").optional().isInt({ min: 1 }),
  body().custom((value, { req }) => {
    const appId = req.body.application_id || req.body.application;
    if (!appId) {
      throw new Error("application_id or application is required");
    }
    const hasSchedule =
      req.body.scheduled_at ||
      (req.body.date && req.body.time) ||
      (req.body.interview_date && req.body.interview_time);
    if (!hasSchedule) {
      throw new Error("scheduled_at or date+time is required");
    }
    return true;
  }),
];

export const interviewIdParam = [
  param("id").isMongoId().withMessage("Invalid interview id"),
];

export const rescheduleRules = [
  ...interviewIdParam,
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reschedule reason is required")
    .isLength({ max: 1000 }),
];

export const companyRescheduleRules = [
  ...interviewIdParam,
  body("scheduled_at").optional().isISO8601(),
  body("interview_date").optional().isISO8601(),
  body("interview_time").optional().isString(),
  body("date").optional().isISO8601(),
  body("time").optional().isString(),
  body("meeting_link").optional().isString().isLength({ max: 500 }),
  body("instructions").optional().isString().isLength({ max: 2000 }),
  body("interviewer_id").optional().isMongoId(),
  body().custom((value, { req }) => {
    const hasSchedule =
      req.body.scheduled_at ||
      (req.body.date && req.body.time) ||
      (req.body.interview_date && req.body.interview_time);
    if (!hasSchedule) {
      throw new Error("scheduled_at or date+time is required");
    }
    return true;
  }),
];

export const statusUpdateRules = [
  ...interviewIdParam,
  body("status")
    .isIn([
      "pending",
      "scheduled",
      "accepted",
      "declined",
      "reschedule_requested",
      "rescheduled",
      "completed",
      "cancelled",
    ])
    .withMessage("Invalid status"),
];

export const feedbackRules = [
  ...interviewIdParam,
  body("technical_skills").isFloat({ min: 0, max: 10 }),
  body("communication").isFloat({ min: 0, max: 10 }),
  body("problem_solving").isFloat({ min: 0, max: 10 }),
  body("confidence").isFloat({ min: 0, max: 10 }),
  body("recommendation").isIn([
    "strong_hire",
    "hire",
    "neutral",
    "no_hire",
    "strong_no_hire",
  ]),
  body("comments").optional().isString().isLength({ max: 5000 }),
  body("rubric_scores").optional().isObject(),
  body("score").optional().isFloat({ min: 0, max: 10 }),
];

export const advanceRoundRules = [
  ...interviewIdParam,
  body("interview_type").isIn(["phone", "video", "in-person"]),
  body("scheduled_at").optional().isISO8601(),
  body("interview_date").optional().isISO8601(),
  body("interview_time").optional().isString(),
  body("interviewer_id").optional().isMongoId(),
  body("meeting_link").optional().isString(),
  body("instructions").optional().isString(),
];
