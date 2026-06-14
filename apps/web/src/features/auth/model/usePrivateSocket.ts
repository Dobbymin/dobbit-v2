"use client";

import { useEffect, useState } from "react";

import { getAuthSocket } from "@/shared";
import type { NotificationCreatedEvent, TradeExecutedEvent, WalletUpdatedEvent } from "@dobbit/shared";
import { useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";

type UsePrivateSocketResult = {
  walletEvent: WalletUpdatedEvent | null;
  tradeEvent: TradeExecutedEvent | null;
  notificationEvent: NotificationCreatedEvent | null;
  socket: Socket | null;
  isConnected: boolean;
};

export const usePrivateSocket = (token?: string): UsePrivateSocketResult => {
  const [walletEvent, setWalletEvent] = useState<WalletUpdatedEvent | null>(null);
  const [tradeEvent, setTradeEvent] = useState<TradeExecutedEvent | null>(null);
  const [notificationEvent, setNotificationEvent] = useState<NotificationCreatedEvent | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getAuthSocket(token);
    setSocketInstance(socket);

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit("private:join");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleWalletUpdate = (event: WalletUpdatedEvent) => {
      setWalletEvent(event);
      queryClient.setQueryData(["wallet"], event);
    };

    const handleTradeExecuted = (event: TradeExecutedEvent) => {
      setTradeEvent(event);
      queryClient.setQueryData(["trade", event.tradeId], event);
    };

    const handleNotificationCreated = (event: NotificationCreatedEvent) => {
      setNotificationEvent(event);
      queryClient.setQueryData(["notification", event.notificationId], event);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("wallet.updated", handleWalletUpdate);
    socket.on("trade.executed", handleTradeExecuted);
    socket.on("notification.created", handleNotificationCreated);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("wallet.updated", handleWalletUpdate);
      socket.off("trade.executed", handleTradeExecuted);
      socket.off("notification.created", handleNotificationCreated);
      socket.disconnect();
      setSocketInstance(null);
    };
  }, [token, queryClient]);

  return {
    walletEvent,
    tradeEvent,
    notificationEvent,
    socket: socketInstance,
    isConnected,
  };
};
