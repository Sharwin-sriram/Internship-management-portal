import * as notificationService from "../services/notificationService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const listNotifications = async (req, res) => {
  try {
    const unreadOnly = req.query.unread === "true";
    const limit = parseInt(req.query.limit, 10) || 50;

    const notifications = await notificationService.getUserNotifications(
      req.user._id,
      { limit, unreadOnly },
    );

    return sendSuccess(res, { data: notifications });
  } catch (error) {
    return sendError(res, error);
  }
};

export const markRead = async (req, res) => {
  try {
    const notification = await notificationService.markNotificationRead(
      req.params.id,
      req.user._id,
    );

    if (!notification) {
      return sendError(res, { message: "Notification not found" }, 404);
    }

    return sendSuccess(res, { data: notification });
  } catch (error) {
    return sendError(res, error);
  }
};

export const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllNotificationsRead(req.user._id);
    return sendSuccess(res, { message: "All notifications marked as read" });
  } catch (error) {
    return sendError(res, error);
  }
};
