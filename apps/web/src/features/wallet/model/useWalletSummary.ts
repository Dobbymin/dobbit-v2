"use client";

import { useQuery } from "@tanstack/react-query";

import { getWalletSummaryApi } from "../api";

import { walletKeys } from "./wallet-query-keys";

export const useWalletSummary = () => {
  return useQuery({
    queryKey: walletKeys.summary(),
    queryFn: getWalletSummaryApi,
    staleTime: 30_000,
  });
};
