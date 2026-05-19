import mongoose from "mongoose";

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    version_number: {
      type: Number,
      required: true,
    },
    file_data: {
      type: Buffer,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    original_name: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    retention_until: {
      type: Date,
      default: () => {
        // 2 years retention by default
        const date = new Date();
        date.setFullYear(date.getFullYear() + 2);
        return date;
      },
    },
    restored_from_version: {
      type: Number,
      default: null,
    },
    change_description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const DocumentVersion = mongoose.model(
  "DocumentVersion",
  documentVersionSchema,
);
export default DocumentVersion;
