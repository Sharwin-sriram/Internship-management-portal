import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    cgpa: {
      type: Number,
      required: true,
    },
    graduation_year: {
      type: Number,
      required: true,
    },
    skills: [
      {
        type: String,
      },
    ],
    skillProficiencies: [
      {
        skill: { type: String },
        proficiency: { type: Number, min: 0, max: 100 },
      },
    ],
    placement_eligible: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      default: "",
    },
    linkedin_url: {
      type: String,
      default: "",
      trim: true,
    },
    github_url: {
      type: String,
      default: "",
      trim: true,
    },
    projects: [
      {
        title: { type: String },
        desc: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
