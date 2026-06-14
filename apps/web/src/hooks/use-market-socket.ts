'use client';

import { getSocket } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface MarketTickerUpdatedEvent {
  type: string;
  marketCode: string;
  tradePrice: number;
  signedChangeRate: number;
  accTradeVolume24h: number;
  timestamp: string;
}

export function useMarketSocket(marketCode: string) {
  const [ticker, setTicker] = useState<MarketTickerUpdatedEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('market:join', { marketCode });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleTickerUpdate = (event: MarketTickerUpdatedEvent) => {
      setTicker(event);
      queryClient.setQueryData(['market', 'ticker', marketCode], event);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('market.ticker.updated', handleTickerUpdate);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.emit('market:leave', { marketCode });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('market.ticker.updated', handleTickerUpdate);
    };
  }, [marketCode, queryClient]);

  return { ticker, isConnected };
}
