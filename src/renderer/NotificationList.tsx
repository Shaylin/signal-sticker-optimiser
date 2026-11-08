import type { Notification } from "./notification";

export interface NotificationListProps {
  notifications: Notification[];
  onDismiss: (notificationId: number) => void;
}

export function NotificationList({ notifications, onDismiss }: NotificationListProps): React.JSX.Element | null {
  if (notifications.length === 0) {
    return null;
  }
  return (
    <div className="notifications">
      {notifications.map((notification) => (
        <Notice key={notification.id} notification={notification} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

interface NoticeProps {
  notification: Notification;
  onDismiss: (notificationId: number) => void;
}

function Notice({ notification, onDismiss }: NoticeProps): React.JSX.Element {
  return (
    <div className={`notice notice-${notification.kind}`} role={notification.kind === "error" ? "alert" : "status"}>
      <span className="notice-text">{notification.message}</span>
      <button className="notice-close" aria-label="Dismiss notification" onClick={() => onDismiss(notification.id)}>
        ×
      </button>
    </div>
  );
}
