export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAtUtc: string;
  isRead: boolean;
  metadata?: any;
}
