import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, required: true, trim: true },
    cgpa:      { type: Number, required: true },
    yearOfStudying: { type: String, required: true, trim: true },
    stream:         { type: String, required: true, trim: true },
    department:     { type: String, required: true, trim: true },
    skills:         { type: [String], default: [] },
    resumeUrl:      { type: String, required: true },
    jobTitle:       { type: String, required: true, trim: true },
    internship:     { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: false },
    interviewDate:  { type: Date },
    interviewTime:  { type: String, trim: true },
    interviewLink:  { type: String, trim: true },
    adminNotes:     { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
    status: {
      type: String,
      enum: ["applied", "pending", "reviewed", "shortlisted", "interview_scheduled", "selected", "rejected", "offer_issued"],
      default: "applied",
    },
  },
  { timestamps: true }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;
