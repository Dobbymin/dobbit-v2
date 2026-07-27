"use client";

import { useMemo } from "react";

import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

import { useRecentlyViewed } from "@/features/market";

import { getRecentlyViewedRows } from "./sidebar-market-rows";

export const useRecentlyViewedPanel = (markets: Market[], tickers: Record<string, MarketTickerUpdatedEvent>) => {
  const { codes } = useRecentlyViewed();
  const rows = useMemo(() => getRecentlyViewedRows(codes, markets, tickers), [codes, markets, tickers]);

  return { hasRecentlyViewed: codes.length > 0, rows };
};
