"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type WithdrawRequest, withdrawApi } from "../api";

import { walletKeys } from "./wallet-query-keys";

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: WithdrawRequest) => withdrawApi(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};
