import React, { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { notificationApi } from '../api/notificationApi';
import type { Notification } from '../types/notification';
import { NotificationContext } from './NotificationContextObject';
import type { ToastType } from './ToastContextObject';

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
    let isActive = true;

    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      try {
        const data = await notificationApi.getAll();
        if (isActive) {
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    void loadNotifications();

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!accessToken || !user) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5244'}/hubs/notifications`, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      const normalizedType = notification.type.toLowerCase();
      const toastType: ToastType =
        normalizedType === 'success' || normalizedType === 'error' || normalizedType === 'warning'
          ? normalizedType
          : 'info';
      showToast(notification.title, toastType);
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
