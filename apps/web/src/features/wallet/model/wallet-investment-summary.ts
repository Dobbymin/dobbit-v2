import type { HeldAsset } from "./useHeldAssets";

export type WalletAllocation = {
  asset: HeldAsset;
  percentage: number;
};

export type WalletInvestmentSummary = {
  assets: HeldAsset[];
  cashAmount: number;
  totalAssetAmount: number;
  totalPurchaseAmount: number;
  totalEvaluatedAmount: number;
  totalProfitAmount: number;
  totalProfitRate: number;
  allocation: WalletAllocation[];
};

export const calculateWalletInvestmentSummary = (assets: HeldAsset[], cashAmount: number): WalletInvestmentSummary => {
  const totalPurchaseAmount = assets.reduce((total, asset) => total + asset.totalCost, 0);
  const totalEvaluatedAmount = assets.reduce((total, asset) => total + asset.liveEvaluatedAmount, 0);
  const totalProfitAmount = assets.reduce((total, asset) => total + asset.liveProfitAmount, 0);
  const allocationAssets = assets.filter((asset) => asset.liveEvaluatedAmount > 0);

  return {
    assets,
    cashAmount,
    totalAssetAmount: cashAmount + totalEvaluatedAmount,
    totalPurchaseAmount,
    totalEvaluatedAmount,
    totalProfitAmount,
    totalProfitRate: totalPurchaseAmount > 0 ? totalProfitAmount / totalPurchaseAmount : 0,
    allocation: allocationAssets.map((asset) => ({
      asset,
      percentage: totalEvaluatedAmount > 0 ? asset.liveEvaluatedAmount / totalEvaluatedAmount : 0,
    })),
  };
};
