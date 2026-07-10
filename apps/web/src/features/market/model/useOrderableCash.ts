"use client";

import { useAuthStore } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { getWalletSummaryApi } from "@/features/wallet/api";
import { walletKeys } from "@/features/wallet/model";

export const useOrderableCash = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: walletKeys.summary(),
    queryFn: getWalletSummaryApi,
    enabled: !!accessToken,
    select: (data) => data.cashAmount,
    staleTime: 30000, // 30 seconds
  });
};
