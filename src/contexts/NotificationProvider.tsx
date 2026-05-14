import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { notificationApi } from '../api/notificationApi';
import type { Notification } from '../types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, accessToken } = useAuth();
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!accessToken || !user) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5244'}/hubs/notifications`, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('LoadUnreadNotifications', (payload: { notifications?: Notification[] }) => {
      const unreadNotifications = payload.notifications ?? [];
      if (unreadNotifications.length === 0) return;

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = unreadNotifications.filter((item) => !existingIds.has(item.id));
        return [...newItems, ...prev].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });

    connection.on('NotificationReceived', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      showToast(notification.title, notification.type.toLowerCase() as any);
    });

    connection.on('NotificationRead', (notificationId: number) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    });

    connection.on('AllNotificationsRead', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });

    connection.start().catch((err) => console.error('SignalR Connection Error: ', err));

    return () => {
      connection.stop();
    };
  }, [accessToken, user, showToast]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationApi.deleteOne(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationApi.deleteAll();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
      refreshNotifications: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
