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

export interface WalletCashHistoryItem {
  id: string;
  type: "DEPOSIT" | "WITHDRAW";
  amount: number;
  reason: string | null;
  createdAt: string;
}

export interface WalletCashHistoryResponse {
  items: WalletCashHistoryItem[];
  limit: number;
  offset: number;
  total: number;
}
