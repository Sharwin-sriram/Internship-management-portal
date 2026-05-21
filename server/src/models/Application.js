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
    source: {
      type: String,
      default: "unknown",
    },
    applied_at: {
      type: Date,
      default: Date.now,
    },
    offer_made_at: {
      type: Date,
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

applicationSchema.pre("save", function () {
  this.last_updated = Date.now();
});

const Application = mongoose.model("Application", applicationSchema);
export default Application;
