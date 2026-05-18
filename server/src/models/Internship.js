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
