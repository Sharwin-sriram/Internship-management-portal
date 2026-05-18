import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    round_number: {
      type: Number,
      required: true,
      default: 1,
    },
    scheduled_at: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["technical", "hr", "managerial", "assignment"],
      required: true,
    },
    interviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    feedback_score: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  },
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
