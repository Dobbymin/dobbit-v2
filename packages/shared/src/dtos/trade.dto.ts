export interface BuyTradeRequest {
  marketCode: string;
  price: number;
  quantity: number;
}

export interface SellTradeRequest {
  marketCode: string;
  price: number;
  quantity: number;
}

export interface TradeResponse {
  id: string;
  marketCode: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  totalAmount: number;
  fee: number;
  executedAt: string;
}

export interface TradeListQuery {
  marketCode?: string;
  side?: "BUY" | "SELL";
  page?: number;
  limit?: number;
}

export interface TradeListResponse {
  items: TradeResponse[];
  page: number;
  limit: number;
  total: number;
}
