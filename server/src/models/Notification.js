import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    action_url: {
      type: String,
      default: "",
    },
    event_type: {
      type: String,
      required: true,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    channel: {
      type: String,
      enum: ["email", "in_app", "sms"],
      default: "in_app",
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    sent_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
