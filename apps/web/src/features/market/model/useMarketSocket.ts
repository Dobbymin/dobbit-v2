"use client";

import { useEffect, useState } from "react";

import { getSocket } from "@/shared";
import type { MarketTickerUpdatedEvent } from "@dobbit/shared";
import { useQueryClient } from "@tanstack/react-query";

export const useMarketSocket = (marketCode: string) => {
  const [ticker, setTicker] = useState<MarketTickerUpdatedEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [prevMarketCode, setPrevMarketCode] = useState(marketCode);
  const queryClient = useQueryClient();

  // 마켓이 바뀌면 렌더 중에 초기화한다. effect에서 지우면 한 프레임 동안
  // 이전 코인의 가격이 그대로 표시된다.
  if (prevMarketCode !== marketCode) {
    setPrevMarketCode(marketCode);
    setTicker(null);
  }

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit("market:join", { marketCode });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleTickerUpdate = (event: MarketTickerUpdatedEvent) => {
      // 현재 구독 중인 marketCode와 일치할 때만 반영
      if (event.marketCode !== marketCode) return;

      setTicker(event);
      queryClient.setQueryData(["market", "ticker", marketCode], event);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("market.ticker.updated", handleTickerUpdate);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.emit("market:leave", { marketCode });
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("market.ticker.updated", handleTickerUpdate);
    };
  }, [marketCode, queryClient]);

  return { ticker, isConnected };
};
