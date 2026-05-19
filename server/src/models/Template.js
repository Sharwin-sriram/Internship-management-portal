import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["offer_letter", "internship_contract"],
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    variables: [
      {
        name: String,
        placeholder: String,
        description: String,
      },
    ],
    is_default: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    last_modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

const Template = mongoose.model("Template", templateSchema);
export default Template;
