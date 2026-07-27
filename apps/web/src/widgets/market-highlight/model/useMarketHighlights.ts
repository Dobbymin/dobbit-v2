"use client";

import { useMemo } from "react";

import { useHomeSummary, useMarketTickers } from "@/features";
import type { HomeHighlight } from "@dobbit/shared";

import { toHighlightDisplayCards } from "./highlight-display";

export const useMarketHighlights = () => {
  const homeSummaryQuery = useHomeSummary();
  const highlights = useMemo(() => homeSummaryQuery.data?.highlights ?? [], [homeSummaryQuery.data]);
  const marketCodes = useMemo(() => highlights.map((item) => item.marketCode), [highlights]);
  const tickers = useMarketTickers(marketCodes);
  const cards = useMemo<HomeHighlight[]>(
    () =>
      highlights.map((item) => {
        const ticker = tickers[item.marketCode];
        return ticker ? { ...item, tradePrice: ticker.tradePrice, signedChangeRate: ticker.signedChangeRate } : item;
      }),
    [highlights, tickers],
  );

  return { cards: toHighlightDisplayCards(cards), isLoading: homeSummaryQuery.isLoading };
};
