import api from "./axios";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  eventId: string | null;
  createdAt: string;
}

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },
};
