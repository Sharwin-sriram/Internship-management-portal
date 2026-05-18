import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doc_type: {
      type: String,
      enum: ["resume", "transcript", "id_proof", "offer_letter", "cover_letter", "certificate", "other"],
      required: true,
    },
    storage_url: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
