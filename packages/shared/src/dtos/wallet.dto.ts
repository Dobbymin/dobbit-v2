export interface CashBalanceResponse {
  amount: number;
}

export interface WalletHolding {
  marketCode: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  totalCost: number;
  currentPrice: number;
  evaluatedAmount: number;
  profitAmount: number;
  profitRate: number;
}

export interface WalletSummaryResponse {
  cashAmount: number;
  totalAssetAmount: number;
  totalEvaluatedAmount: number;
  totalProfitAmount: number;
  totalProfitRate: number;
}

export interface WalletHoldingsResponse {
  items: WalletHolding[];
}
