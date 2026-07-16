"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";

import { usePrivateSocket } from "../../auth/model";

import { walletKeys } from "./wallet-query-keys";

export const useWalletRealtime = () => {
  const accessToken = useAuthStore((state) => state.accessToken) ?? undefined;
  const queryClient = useQueryClient();
  const { walletEvent, tradeEvent } = usePrivateSocket(accessToken);

  useEffect(() => {
    if (walletEvent || tradeEvent) {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    }
  }, [walletEvent, tradeEvent, queryClient]);
};
