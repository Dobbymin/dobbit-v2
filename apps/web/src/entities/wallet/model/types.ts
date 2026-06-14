export type WalletAsset = {
  currency: string;
  balance: number;
  locked: number;
  averageBuyPrice: number;
  evaluatedPrice: number;
  profitLoss: number;
  profitLossRate: number;
};

export type WalletSummary = {
  cashBalance: number;
  totalAssetValue: number;
  totalProfitLoss: number;
  totalProfitLossRate: number;
};
