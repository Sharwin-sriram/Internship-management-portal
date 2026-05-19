import mongoose from "mongoose";

const talentUnlockRequestSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approved_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

talentUnlockRequestSchema.index({ company: 1, student: 1 }, { unique: true });

const TalentUnlockRequest = mongoose.model("TalentUnlockRequest", talentUnlockRequestSchema);
export default TalentUnlockRequest;
