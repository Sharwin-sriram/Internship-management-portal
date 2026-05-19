import mongoose from "mongoose";

const documentVerificationSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verification_date: {
      type: Date,
      default: null,
    },
    comments: {
      type: String,
      default: null,
    },
    rejection_reason: {
      type: String,
      default: null,
    },
    resubmission_required: {
      type: Boolean,
      default: false,
    },
    resubmission_deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const DocumentVerification = mongoose.model(
  "DocumentVerification",
  documentVerificationSchema,
);
export default DocumentVerification;
