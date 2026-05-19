import mongoose from "mongoose";

const internshipContractSchema = new mongoose.Schema(
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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "ready_for_signing",
        "pending_student_sign",
        "pending_company_sign",
        "signed",
        "completed",
        "terminated",
      ],
      default: "draft",
    },
    pdf_url: {
      type: String,
      default: null,
    },
    contract_details: {
      start_date: {
        type: Date,
        required: true,
      },
      end_date: {
        type: Date,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
      stipend: {
        type: Number,
        required: true,
      },
      reporting_to: {
        type: String,
        required: true,
      },
      responsibilities: [String],
    },
    student_signature: {
      signed: {
        type: Boolean,
        default: false,
      },
      signature_url: {
        type: String,
        default: null,
      },
      signed_at: {
        type: Date,
        default: null,
      },
      ip_address: {
        type: String,
        default: null,
      },
    },
    company_signature: {
      signed: {
        type: Boolean,
        default: false,
      },
      signature_url: {
        type: String,
        default: null,
      },
      signed_at: {
        type: Date,
        default: null,
      },
      signed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      ip_address: {
        type: String,
        default: null,
      },
    },
    approval_status: {
      coordinator_approved: {
        type: Boolean,
        default: false,
      },
      approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      approval_date: {
        type: Date,
        default: null,
      },
      approval_notes: {
        type: String,
        default: null,
      },
    },
    signature_requests: [
      {
        recipient_role: {
          type: String,
          enum: ["student", "company"],
          required: true,
        },
        recipient_email: {
          type: String,
          required: true,
        },
        request_sent_at: {
          type: Date,
          default: Date.now,
        },
        request_status: {
          type: String,
          enum: ["pending", "viewed", "signed", "rejected"],
          default: "pending",
        },
        reminder_count: {
          type: Number,
          default: 0,
        },
      },
    ],
    activity_log: [
      {
        action: String,
        performed_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        description: String,
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const InternshipContract = mongoose.model(
  "InternshipContract",
  internshipContractSchema,
);
export default InternshipContract;
