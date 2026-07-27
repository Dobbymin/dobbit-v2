"use client";

import { useMemo } from "react";

import { useHeldAssets } from "./useHeldAssets";
import { useWalletSummary } from "./useWalletSummary";
import { calculateWalletInvestmentSummary } from "./wallet-investment-summary";

export const useWalletInvestmentSummary = () => {
  const heldAssets = useHeldAssets();
  const walletSummary = useWalletSummary();
  const data = useMemo(
    () => calculateWalletInvestmentSummary(heldAssets.data, walletSummary.data?.cashAmount ?? 0),
    [heldAssets.data, walletSummary.data?.cashAmount],
  );

  return {
    data,
    isSummaryAvailable: walletSummary.data !== undefined,
    isLoading: heldAssets.isLoading || walletSummary.isLoading,
    isFetching: heldAssets.isFetching || walletSummary.isFetching,
    error: heldAssets.error || walletSummary.error,
  };
};
