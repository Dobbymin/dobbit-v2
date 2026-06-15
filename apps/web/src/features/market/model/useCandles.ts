"use client";

import { useQuery } from "@tanstack/react-query";

import { getCandlesApi } from "../api";

import { marketKeys } from "./market-query-keys";

export const useCandles = (marketCode?: string, unit: number = 1) => {
  return useQuery({
    queryKey: marketKeys.candles(marketCode ?? "", unit),
    queryFn: () => getCandlesApi(marketCode ?? "", unit),
    enabled: Boolean(marketCode),
    staleTime: 10_000,
  });
};
