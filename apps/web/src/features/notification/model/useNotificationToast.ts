"use client";
import { useCallback, useEffect, useState } from "react";

import type { NotificationCreatedEvent, NotificationDeliveryFailedEvent } from "@dobbit/shared";
import { useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";

import { NOTIFICATION_QUERY_KEYS } from "./notification-query-keys";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  createdAt: string;
};

export const useNotificationToast = (socket: Socket | null) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const queryClient = useQueryClient();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handler = (event: NotificationCreatedEvent) => {
      const toast: ToastItem = {
        id: event.notificationId,
        title: event.title,
        message: event.message,
        severity: event.severity,
        createdAt: event.createdAt,
      };
      setToasts((prev) => [toast, ...prev].slice(0, 5));
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });

      if (event.severity !== "CRITICAL") {
        setTimeout(() => dismiss(toast.id), 5000);
      }
    };

    const deliveryFailedHandler = (event: NotificationDeliveryFailedEvent) => {
      const toast: ToastItem = {
        id: `${event.notificationId}:delivery-failed`,
        title: "Slack 알림 발송 실패",
        message: event.reason,
        severity: "WARNING",
        createdAt: event.failedAt,
      };
      setToasts((prev) => [toast, ...prev].slice(0, 5));
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.slack() });
    };

    socket.on("notification.created", handler);
    socket.on("notification.delivery.failed", deliveryFailedHandler);
    return () => {
      socket.off("notification.created", handler);
      socket.off("notification.delivery.failed", deliveryFailedHandler);
    };
  }, [socket, queryClient, dismiss]);

  return { toasts, dismiss };
};
