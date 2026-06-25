import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios.js';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n) => !n.read).length);
    } catch {
      // silently fail — user may not be authenticated
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    intervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  const removeNotification = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => {
        const updated = prev.filter((n) => n._id !== id);
        return updated;
      });
      setUnreadCount((prev) => {
        const wasUnread = notifications.find((n) => n._id === id && !n.read);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch {
      // silently fail
    }
  }, [notifications]);

  return { notifications, unreadCount, markRead, markAllRead, removeNotification, loading };
}
