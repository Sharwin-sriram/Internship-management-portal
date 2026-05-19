import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["google"],
      default: "google",
    },
    external_event_id: {
      type: String,
      default: "",
    },
    calendar_id: {
      type: String,
      default: "primary",
    },
    sync_status: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
    },
    html_link: {
      type: String,
      default: "",
    },
    raw_response: {
      type: mongoose.Schema.Types.Mixed,
    },
    last_synced_at: {
      type: Date,
    },
  },
  { timestamps: true },
);

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);
export default CalendarEvent;
