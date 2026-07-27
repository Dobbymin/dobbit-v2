"use client";

import { useMemo } from "react";

import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

import { getRealtimeRankingRows } from "./sidebar-market-rows";

export const useRealtimeRankingPanel = (markets: Market[], tickers: Record<string, MarketTickerUpdatedEvent>) =>
  useMemo(() => getRealtimeRankingRows(markets, tickers), [markets, tickers]);
