import { apiClient } from "@/shared";
import type {
  MarkNotificationReadResponse,
  NotificationListResponse,
  SlackIntegrationResponse,
  SlackTestResponse,
  SlackWebhookUpsertRequest,
} from "@dobbit/shared";

export const getNotifications = (unreadOnly?: boolean): Promise<NotificationListResponse> => {
  const params = unreadOnly ? "?unreadOnly=true" : "";
  return apiClient<NotificationListResponse>(`/alert/notifications${params}`);
};

export const markNotificationRead = (notificationId: string): Promise<MarkNotificationReadResponse> =>
  apiClient<MarkNotificationReadResponse>(`/alert/notifications/${notificationId}/read`, { method: "PATCH" });

export const getSlackIntegration = (): Promise<SlackIntegrationResponse> =>
  apiClient<SlackIntegrationResponse>("/alert/slack");

export const saveSlackIntegration = (request: SlackWebhookUpsertRequest): Promise<SlackIntegrationResponse> =>
  apiClient<SlackIntegrationResponse>("/alert/slack", {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const testSlackIntegration = (): Promise<SlackTestResponse> =>
  apiClient<SlackTestResponse>("/alert/slack/test", { method: "POST" });
