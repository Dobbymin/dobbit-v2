"use client";

import { useQuery } from "@tanstack/react-query";

import { getWalletCashHistoryApi } from "../api";

import { walletKeys } from "./wallet-query-keys";

export const useWalletCashHistory = (limit = 50, offset = 0) => {
  return useQuery({
    queryKey: walletKeys.cashHistory(limit, offset),
    queryFn: () => getWalletCashHistoryApi({ limit, offset }),
    staleTime: 30_000,
  });
};
