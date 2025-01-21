import axiosInstance from '@/lib/axios';

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  async getNotifications(userId: number): Promise<Notification[]> {
    const response = await axiosInstance.get(`/notifications/user/${userId}`);
    return response.data;
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const response = await axiosInstance.get(`/notifications/user/${userId}/unread`);
    return response.data;
  }

  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  }
}

export const notificationService = new NotificationService();
