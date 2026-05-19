import mongoose from "mongoose";

const interviewRoundSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    round_number: {
      type: Number,
      required: true,
      min: 1,
    },
    outcome: {
      type: String,
      enum: ["pending", "passed", "failed", "skipped"],
      default: "pending",
    },
    advanced_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    advanced_at: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

interviewRoundSchema.index({ application: 1, round_number: 1 }, { unique: true });

const InterviewRound = mongoose.model("InterviewRound", interviewRoundSchema);
export default InterviewRound;
