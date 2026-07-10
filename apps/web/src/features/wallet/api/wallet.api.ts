import { apiClient } from "@/shared";
import type { WalletHolding, WalletSummaryResponse } from "@dobbit/shared";

export type DepositRequest = {
  amount: number;
};

export type WithdrawRequest = {
  amount: number;
};

export type DepositResponse = {
  cashBalance: number;
};

export type WithdrawResponse = {
  cashBalance: number;
};

export const getWalletAssetsApi = (): Promise<WalletHolding[]> => apiClient<WalletHolding[]>("/wallet/holdings");

export const getWalletSummaryApi = (): Promise<WalletSummaryResponse> =>
  apiClient<WalletSummaryResponse>("/wallet/summary");

export const depositApi = (request: DepositRequest): Promise<DepositResponse> =>
  apiClient<DepositResponse>("/wallet/deposit", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const withdrawApi = (request: WithdrawRequest): Promise<WithdrawResponse> =>
  apiClient<WithdrawResponse>("/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify(request),
  });
