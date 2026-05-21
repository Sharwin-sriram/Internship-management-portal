import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stipend_min: {
      type: Number,
      required: true,
    },
    stipend_max: {
      type: Number,
      required: true,
    },
    // Array of required skills (stored as lowercase strings)
    skills_required: {
      type: [String],
      default: [],
    },
    // Duration (human readable, e.g. "3 months", "12 weeks")
    duration: {
      type: String,
      default: "",
    },
    // Location mode: on-site / remote / hybrid
    location: {
      type: String,
      enum: ["on-site", "remote", "hybrid"],
      default: "remote",
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },
    batch_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Internship = mongoose.model("Internship", internshipSchema);
export default Internship;
