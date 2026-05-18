import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interviewing", "selected", "rejected"],
      default: "applied",
    },
    resume_version: {
      type: String,
      required: true,
    },
    cover_letter: {
      type: String,
    },
    applied_at: {
      type: Date,
      default: Date.now,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Update last_updated on save
applicationSchema.pre("save", function (next) {
  this.last_updated = Date.now();
  next();
});

const Application = mongoose.model("Application", applicationSchema);
export default Application;
