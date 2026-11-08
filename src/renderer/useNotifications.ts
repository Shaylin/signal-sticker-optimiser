import { useCallback, useState } from "react";
import type { Notification, NotificationKind } from "./notification";

export const maxVisibleNotifications = 5;

export interface NotificationHub {
  notifications: Notification[];
  notify: (kind: NotificationKind, message: string) => void;
  dismiss: (notificationId: number) => void;
}

let nextNotificationId = 1;

export function useNotifications(): NotificationHub {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((kind: NotificationKind, message: string): void => {
    const notification = { id: nextNotificationId++, kind, message };
    setNotifications((current) => [...current, notification].slice(-maxVisibleNotifications));
  }, []);

  const dismiss = useCallback((notificationId: number): void => {
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
  }, []);

  return { notifications, notify, dismiss };
}
