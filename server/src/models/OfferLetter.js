import mongoose from "mongoose";

const offerLetterSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "generated", "sent", "accepted", "rejected", "expired"],
      default: "draft",
    },
    pdf_url: {
      type: String,
      default: null,
    },
    sent_date: {
      type: Date,
      default: null,
    },
    accepted_date: {
      type: Date,
      default: null,
    },
    rejected_date: {
      type: Date,
      default: null,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    email_sent: {
      type: Boolean,
      default: false,
    },
    email_sent_at: {
      type: Date,
      default: null,
    },
    custom_details: {
      salary: {
        type: Number,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
      start_date: {
        type: Date,
        required: true,
      },
      responsibilities: [String],
      benefits: [String],
    },
    generated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const OfferLetter = mongoose.model("OfferLetter", offerLetterSchema);
export default OfferLetter;
