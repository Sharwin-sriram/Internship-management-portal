import api from "../lib/axios";

export interface NotificationItem {
  _id: string;
  title?: string;
  message?: string;
  event_type: string;
  is_read?: boolean;
  createdAt?: string;
  action_url?: string;
}

export async function listNotifications(params?: { unreadOnly?: boolean; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.unreadOnly) search.set("unread", "true");
  if (params?.limit) search.set("limit", String(params.limit));
  const q = search.toString();
  const { data } = await api.get<{ data: NotificationItem[] }>(
    `/notifications${q ? `?${q}` : ""}`,
  );
  return data.data ?? [];
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<{ data: NotificationItem }>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  await api.patch("/notifications/read-all");
}
