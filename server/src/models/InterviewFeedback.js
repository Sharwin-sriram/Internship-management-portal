import mongoose from "mongoose";

const interviewFeedbackSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },
    interviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technical_skills: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    communication: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    problem_solving: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
    recommendation: {
      type: String,
      enum: ["strong_hire", "hire", "neutral", "no_hire", "strong_no_hire"],
      required: true,
    },
    rubric_scores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    released_to_student: {
      type: Boolean,
      default: false,
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const InterviewFeedback = mongoose.model(
  "InterviewFeedback",
  interviewFeedbackSchema,
);
export default InterviewFeedback;
