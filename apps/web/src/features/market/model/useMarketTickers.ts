"use client";

import { useEffect, useState } from "react";

import { getSocket } from "@/shared";
import type { MarketTickerUpdatedEvent } from "@dobbit/shared";

const marketSubscriptionCounts = new Map<string, number>();

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
      codes.forEach((code) => {
        const currentCount = marketSubscriptionCounts.get(code) ?? 0;
        marketSubscriptionCounts.set(code, currentCount + 1);

        if (currentCount === 0) {
          socket.emit("market:join", { marketCode: code });
        }
      });
    } else {
      codes.forEach((code) => {
        const currentCount = marketSubscriptionCounts.get(code) ?? 0;
        marketSubscriptionCounts.set(code, currentCount + 1);
      });
      socket.connect();
    }

    // Cleanup
    return () => {
      codes.forEach((code) => {
        const currentCount = marketSubscriptionCounts.get(code) ?? 0;

        if (currentCount === 1) {
          marketSubscriptionCounts.delete(code);
          socket.emit("market:leave", { marketCode: code });
          return;
        }

        if (currentCount > 1) {
          marketSubscriptionCounts.set(code, currentCount - 1);
        }
      });
      socket.off("connect", joinAll);
      socket.off("market.ticker.updated", handleTickerUpdate);
    };
  }, [codesKey]);

  return tickers;
};
