"use client";

import { useMemo, useState } from "react";

import { useHomeSummary, useMarketTickers } from "@/features";
import type { HomeRankingItem, HomeSummaryResponse } from "@dobbit/shared";

import { toRankingDisplayRows } from "./ranking-display";

export type RankingTab = keyof HomeSummaryResponse["rankings"];

export const RANKING_TABS: Array<{ key: RankingTab; label: string }> = [
  { key: "tradePrice", label: "거래대금" },
  { key: "surge", label: "급상승" },
  { key: "plunge", label: "급락" },
  { key: "volume", label: "거래량" },
];

export const useMarketRanking = () => {
  const [activeTab, setActiveTab] = useState<RankingTab>("tradePrice");
  const homeSummaryQuery = useHomeSummary();
  const rankings = useMemo(() => homeSummaryQuery.data?.rankings[activeTab] ?? [], [activeTab, homeSummaryQuery.data]);
  const marketCodes = useMemo(() => rankings.map((item) => item.marketCode), [rankings]);
  const tickers = useMarketTickers(marketCodes);
  const rows = useMemo<HomeRankingItem[]>(
    () =>
      rankings.map((item) => {
        const ticker = tickers[item.marketCode];
        return ticker ? { ...item, tradePrice: ticker.tradePrice, signedChangeRate: ticker.signedChangeRate } : item;
      }),
    [rankings, tickers],
  );

  return { activeTab, isLoading: homeSummaryQuery.isLoading, marketCodes, rows: toRankingDisplayRows(rows), setActiveTab };
};
