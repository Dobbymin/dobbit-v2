"use client";

import { useQuery } from "@tanstack/react-query";

import { getMarketsApi, getTickerApi, type MarketListQuery } from "../api";

import { marketKeys } from "./market-query-keys";

export const useMarkets = (query?: MarketListQuery) => {
  return useQuery({
    queryKey: marketKeys.list(query),
    queryFn: () => getMarketsApi(query),
    staleTime: 30_000,
  });
};

export const useTicker = (marketCode?: string) => {
  return useQuery({
    queryKey: marketKeys.ticker(marketCode ?? ""),
    queryFn: () => getTickerApi(marketCode ?? ""),
    enabled: Boolean(marketCode),
    staleTime: 10_000,
  });
};
