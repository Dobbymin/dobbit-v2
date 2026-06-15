import { apiClient } from "@/shared";

import type { WalletAsset, WalletSummary } from "@/entities/wallet";

export type DepositRequest = {
  amount: number;
};

export type DepositResponse = {
  cashBalance: number;
};

export const getWalletAssetsApi = (): Promise<WalletAsset[]> => apiClient<WalletAsset[]>("/wallet/holdings");

export const getWalletSummaryApi = (): Promise<WalletSummary> => apiClient<WalletSummary>("/wallet/summary");

export const depositApi = (request: DepositRequest): Promise<DepositResponse> =>
  apiClient<DepositResponse>("/wallet/deposit", {
    method: "POST",
    body: JSON.stringify(request),
  });
