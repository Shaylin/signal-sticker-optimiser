export type NotificationKind = "info" | "error";

export interface Notification {
  id: number;
  kind: NotificationKind;
  message: string;
}
