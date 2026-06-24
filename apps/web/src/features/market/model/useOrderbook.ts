"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrderbookApi } from "../api";

import { marketKeys } from "./market-query-keys";

export const useOrderbook = (marketCode?: string) => {
  return useQuery({
    queryKey: marketKeys.orderbook(marketCode ?? ""),
    queryFn: () => getOrderbookApi(marketCode ?? ""),
    enabled: Boolean(marketCode),
    refetchInterval: 1000,
    staleTime: 0,
  });
};
