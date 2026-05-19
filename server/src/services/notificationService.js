import Notification from "../models/Notification.js";
import logger from "../utils/logger.js";

/**
 * Create in-app notification(s) for one or more users.
 */
export async function createInAppNotification({
  userIds,
  event_type,
  title,
  message,
  action_url = "",
  payload = {},
}) {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  const docs = ids.filter(Boolean).map((userId) => ({
    user: userId,
    event_type,
    title,
    message,
    action_url,
    payload,
    channel: "in_app",
    is_read: false,
    sent_at: new Date(),
  }));

  if (!docs.length) return [];

  const created = await Notification.insertMany(docs);
  logger.info(`Created ${created.length} in-app notification(s): ${event_type}`);
  return created;
}

export async function getUserNotifications(userId, { limit = 50, unreadOnly = false } = {}) {
  const query = { user: userId, channel: "in_app" };
  if (unreadOnly) query.is_read = false;

  return Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
}

export async function markNotificationRead(notificationId, userId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { is_read: true },
    { new: true },
  );
}

export async function markAllNotificationsRead(userId) {
  return Notification.updateMany(
    { user: userId, channel: "in_app", is_read: false },
    { is_read: true },
  );
}
