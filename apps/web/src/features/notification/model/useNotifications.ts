"use client";
import type { SlackWebhookUpsertRequest } from "@dobbit/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  getSlackIntegration,
  markNotificationRead,
  saveSlackIntegration,
  testSlackIntegration,
} from "../api";

import { NOTIFICATION_QUERY_KEYS } from "./notification-query-keys";

export const useNotifications = (unreadOnly?: boolean) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(unreadOnly),
    queryFn: () => getNotifications(unreadOnly),
    staleTime: 30_000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};

export const useSlackIntegration = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.slack(),
    queryFn: getSlackIntegration,
    staleTime: 30_000,
  });
};

export const useSaveSlackIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SlackWebhookUpsertRequest) => saveSlackIntegration(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.slack() });
    },
  });
};

export const useTestSlackIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testSlackIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.slack() });
    },
  });
};
