import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    scheduled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    round_number: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    scheduled_at: {
      type: Date,
      required: true,
      index: true,
    },
    interview_date: {
      type: Date,
    },
    interview_time: {
      type: String,
      trim: true,
    },
    interview_type: {
      type: String,
      enum: ["phone", "video", "in-person"],
      required: true,
    },
    interviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    meeting_link: {
      type: String,
      default: "",
      trim: true,
    },
    instructions: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "scheduled",
        "accepted",
        "declined",
        "reschedule_requested",
        "rescheduled",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    reschedule_reason: {
      type: String,
      default: "",
    },
    reschedule_requested_at: {
      type: Date,
    },
    invitation_sent_at: {
      type: Date,
    },
    reminders_sent: {
      hours_24: { type: Boolean, default: false },
      hours_1: { type: Boolean, default: false },
    },
    google_event_id: {
      type: String,
      default: "",
    },
    feedback_score: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  { timestamps: true },
);

interviewSchema.index({ interviewer_id: 1, scheduled_at: 1 });
interviewSchema.index({ student: 1, scheduled_at: 1 });
interviewSchema.index({ company: 1, scheduled_at: 1 });

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
