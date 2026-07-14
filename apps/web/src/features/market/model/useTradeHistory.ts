"use client";

import { useAuthStore } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { getTradeHistoryApi } from "../api";

import { marketKeys } from "./market-query-keys";

export const useTradeHistory = (limit: number = 50, offset: number = 0) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: marketKeys.tradeHistory(limit, offset),
    queryFn: () => getTradeHistoryApi(limit, offset),
    enabled: !!accessToken,
    staleTime: 30000, // 30 seconds
  });
};
