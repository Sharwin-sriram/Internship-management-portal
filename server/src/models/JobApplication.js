import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, required: true, trim: true },
    yearOfStudying: { type: String, required: true, trim: true },
    stream:         { type: String, required: true, trim: true },
    department:     { type: String, required: true, trim: true },
    skills:         { type: [String], default: [] },
    resumeUrl:      { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;
