"use client";

import { useEffect, useState } from "react";

import { getSocket } from "@/shared";
import type { MarketTickerUpdatedEvent } from "@dobbit/shared";

export const useMarketTickers = (marketCodes: string[]): Record<string, MarketTickerUpdatedEvent> => {
  const [tickers, setTickers] = useState<Record<string, MarketTickerUpdatedEvent>>({});
  // Stable dependency key for marketCodes
  const codesKey = marketCodes.join(",");

  useEffect(() => {
    // Reconstruct codes from stable key to avoid direct marketCodes dependency
    const codes = codesKey ? codesKey.split(",") : [];

    // Early exit if no codes
    if (codes.length === 0) {
      return;
    }

    const socket = getSocket();

    const joinAll = () => {
      codes.forEach((code) => {
        socket.emit("market:join", { marketCode: code });
      });
    };

    const handleTickerUpdate = (event: MarketTickerUpdatedEvent) => {
      setTickers((prev) => ({
        ...prev,
        [event.marketCode]: event,
      }));
    };

    // Register listeners before connecting
    socket.on("connect", joinAll);
    socket.on("market.ticker.updated", handleTickerUpdate);

    // Connect or subscribe immediately if already connected
    if (socket.connected) {
      joinAll();
    } else {
      socket.connect();
    }

    // Cleanup
    return () => {
      codes.forEach((code) => {
        socket.emit("market:leave", { marketCode: code });
      });
      socket.off("connect", joinAll);
      socket.off("market.ticker.updated", handleTickerUpdate);
    };
  }, [codesKey]);

  return tickers;
};
