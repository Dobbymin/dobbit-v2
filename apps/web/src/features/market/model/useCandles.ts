"use client";

import { useQuery } from "@tanstack/react-query";

import { getCandlesApi } from "../api";

import { DEFAULT_CANDLE_INTERVAL } from "./libs";
import type { CandleInterval } from "./libs";
import { marketKeys } from "./market-query-keys";

export const useCandles = (marketCode?: string, interval: CandleInterval = DEFAULT_CANDLE_INTERVAL) => {
  return useQuery({
    queryKey: marketKeys.candles(marketCode ?? "", interval),
    queryFn: () => getCandlesApi(marketCode ?? "", interval),
    enabled: Boolean(marketCode),
    staleTime: 10_000,
  });
};
