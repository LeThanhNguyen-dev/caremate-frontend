import axiosInstance from './axios';
import type { Notification } from '../types/notification';

export const notificationApi = {
  getAll: async () => {
    const response = await axiosInstance.get<Notification[]>('/api/notifications/mine');
    return response.data;
  },

  markAsRead: async (id: number) => {
    await axiosInstance.patch(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await axiosInstance.patch('/api/notifications/read-all');
  },

  /** DELETE /api/notifications/{id} — Xóa 1 thông báo */
  deleteOne: async (id: number) => {
    await axiosInstance.delete(`/api/notifications/${id}`);
  },

  /** DELETE /api/notifications — Xóa tất cả thông báo */
  deleteAll: async () => {
    await axiosInstance.delete('/api/notifications');
  },
};

export default notificationApi;
