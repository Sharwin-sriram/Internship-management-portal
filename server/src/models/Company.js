import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company_name: {
      type: String,
      default: "",
    },
    legal_name: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    primary_contact: {
      name: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      title: {
        type: String,
        default: "",
      },
    },
    logo_url: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    social_links: [
      {
        platform: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    office_locations: [
      {
        label: {
          type: String,
          default: "",
        },
        address_line1: {
          type: String,
          required: true,
        },
        address_line2: {
          type: String,
          default: "",
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          default: "",
        },
        country: {
          type: String,
          required: true,
        },
        postal_code: {
          type: String,
          default: "",
        },
      },
    ],
    recruiters: [
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          default: "",
        },
        title: {
          type: String,
          default: "",
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    is_verified: {
      type: Boolean,
      default: false,
    },
    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    profile_completed: {
      type: Boolean,
      default: false,
    },
    profile_completed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Company = mongoose.model("Company", companySchema);
export default Company;
