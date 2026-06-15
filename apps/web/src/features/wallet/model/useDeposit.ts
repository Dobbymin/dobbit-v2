"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type DepositRequest, depositApi } from "../api";

import { walletKeys } from "./wallet-query-keys";

export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DepositRequest) => depositApi(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};
