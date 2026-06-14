'use client';

import { getAuthSocket } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface WalletUpdatedEvent {
  type: string;
  userId: string;
  totalBalance: number;
  availableBalance: number;
  timestamp: string;
}

interface TradeExecutedEvent {
  type: string;
  tradeId: string;
  userId: string;
  marketCode: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  totalAmount: number;
  timestamp: string;
}

interface NotificationCreatedEvent {
  type: string;
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  timestamp: string;
}

interface UsePrivateSocketResult {
  walletEvent: WalletUpdatedEvent | null;
  tradeEvent: TradeExecutedEvent | null;
  notificationEvent: NotificationCreatedEvent | null;
  isConnected: boolean;
}

export function usePrivateSocket(token?: string): UsePrivateSocketResult {
  const [walletEvent, setWalletEvent] = useState<WalletUpdatedEvent | null>(null);
  const [tradeEvent, setTradeEvent] = useState<TradeExecutedEvent | null>(null);
  const [notificationEvent, setNotificationEvent] = useState<NotificationCreatedEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getAuthSocket(token);

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('private:join');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleWalletUpdate = (event: WalletUpdatedEvent) => {
      setWalletEvent(event);
      queryClient.setQueryData(['wallet'], event);
    };

    const handleTradeExecuted = (event: TradeExecutedEvent) => {
      setTradeEvent(event);
      queryClient.setQueryData(['trade', event.tradeId], event);
    };

    const handleNotificationCreated = (event: NotificationCreatedEvent) => {
      setNotificationEvent(event);
      queryClient.setQueryData(['notification', event.notificationId], event);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('wallet.updated', handleWalletUpdate);
    socket.on('trade.executed', handleTradeExecuted);
    socket.on('notification.created', handleNotificationCreated);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('wallet.updated', handleWalletUpdate);
      socket.off('trade.executed', handleTradeExecuted);
      socket.off('notification.created', handleNotificationCreated);
      socket.disconnect();
    };
  }, [token, queryClient]);

  return {
    walletEvent,
    tradeEvent,
    notificationEvent,
    isConnected,
  };
}
