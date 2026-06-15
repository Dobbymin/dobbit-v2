"use client";

import { useQuery } from "@tanstack/react-query";

import { getWalletAssetsApi } from "../api";

import { walletKeys } from "./wallet-query-keys";

export const useWalletAssets = () => {
  return useQuery({
    queryKey: walletKeys.assets(),
    queryFn: getWalletAssetsApi,
    staleTime: 30_000,
  });
};
