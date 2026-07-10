"use client";

import type { SellTradeRequest } from "@dobbit/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { walletKeys } from "@/features/wallet/model";

import { sellOrderApi } from "../api";

export const useSellOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SellTradeRequest) => sellOrderApi(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};
