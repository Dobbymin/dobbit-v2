"use client";

import type { BuyTradeRequest } from "@dobbit/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { walletKeys } from "@/features/wallet/model";

import { buyOrderApi } from "../api";

export const useBuyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BuyTradeRequest) => buyOrderApi(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};
