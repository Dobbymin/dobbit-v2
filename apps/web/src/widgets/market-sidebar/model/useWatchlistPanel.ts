"use client";

import { useEffect, useMemo, useState } from "react";

import { useIsAuth } from "@/shared";
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

import { useFavorites } from "@/features/favorite";
import { toMarketRow } from "@/features/market";
import { useNews } from "@/features/news";

import { getNewsHeadlines, getWatchlistPanelMarketData } from "./watchlist-panel";

const HEADLINE_ROTATION_INTERVAL = 4000;
const EMPTY_FAVORITE_CODES = new Set<string>();

export const useWatchlistPanel = (markets: Market[], tickers: Record<string, MarketTickerUpdatedEvent>) => {
  const { isAuthenticated } = useIsAuth();
  const favoritesQuery = useFavorites();
  const news = useNews({ limit: 10 });
  const favoriteCodes = favoritesQuery.data ?? EMPTY_FAVORITE_CODES;
  const { hasNoFavorites, source } = useMemo(
    () =>
      getWatchlistPanelMarketData({
        markets,
        tickers,
        favoriteCodes,
        canShowFallback: isAuthenticated && favoritesQuery.data !== undefined,
      }),
    [favoriteCodes, favoritesQuery.data, isAuthenticated, markets, tickers],
  );
  const rows = useMemo(() => source.map((market) => toMarketRow(market, tickers[market.code])), [source, tickers]);
  const headlines = useMemo(() => getNewsHeadlines(news.data ?? []), [news.data]);
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    setHeadlineIndex(0);
  }, [headlines.length]);

  useEffect(() => {
    if (headlines.length <= 1) return;

    const timer = setInterval(() => {
      setHeadlineIndex((previous) => (previous + 1) % headlines.length);
    }, HEADLINE_ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, [headlines.length]);

  return {
    hasNoFavorites,
    headline: headlines[headlineIndex],
    headlineIndex,
    isAuthenticated,
    rows,
  };
};
