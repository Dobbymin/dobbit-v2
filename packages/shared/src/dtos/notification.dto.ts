export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type NotificationChannel = 'WEBSOCKET' | 'SLACK';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface NotificationDelivery {
  channel: NotificationChannel;
  status: DeliveryStatus;
  errorMessage?: string;
}

export interface NotificationItem {
  id: string;
  marketCode?: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  readAt: string | null;
  createdAt: string;
  deliveries: NotificationDelivery[];
}

export interface NotificationListQuery {
  unreadOnly?: boolean;
  marketCode?: string;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  page: number;
  limit: number;
  total: number;
}
