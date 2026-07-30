"use client";

import { useEffect, useState } from "react";

import { getSocket } from "@/shared";
import type { MarketOrderbookUpdatedEvent } from "@dobbit/shared";

import { marketSubscriptionCounts } from "./useMarketTickers";

export const useMarketOrderbooks = (marketCodes: string[]): Record<string, MarketOrderbookUpdatedEvent> => {
  const [orderbooks, setOrderbooks] = useState<Record<string, MarketOrderbookUpdatedEvent>>({});
  const codesKey = marketCodes.join(",");

  useEffect(() => {
    const codes = codesKey ? codesKey.split(",") : [];

    if (codes.length === 0) {
      return;
    }

    const socket = getSocket();

    const joinAll = () => {
      codes.forEach((code) => {
        socket.emit("market:join", { marketCode: code });
      });
    };

    const handleOrderbookUpdate = (event: MarketOrderbookUpdatedEvent) => {
      setOrderbooks((prev) => ({
        ...prev,
        [event.marketCode]: event,
      }));
    };

    socket.on("connect", joinAll);
    socket.on("market.orderbook.updated", handleOrderbookUpdate);

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
      socket.off("market.orderbook.updated", handleOrderbookUpdate);
    };
  }, [codesKey]);

  return orderbooks;
};
