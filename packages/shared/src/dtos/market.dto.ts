export interface Market {
  id: string;
  code: string;
  symbol: string;
  koreanName: string;
  englishName: string;
  isActive: boolean;
}

export interface MarketSummary extends Market {
  tradePrice: number;
  signedChangeRate: number;
  accTradeVolume24h: number;
}

export interface MarketSnapshot {
  id: string;
  marketCode: string;
  tradePrice: number;
  signedChangeRate: number;
  accTradeVolume24h: number;
  snapshotAt: string;
}

export interface CurrentPrice {
  marketCode: string;
  tradePrice: number;
  signedChangeRate: number;
  signedChangePrice: number;
  timestamp: string;
}

export interface OrderbookResponse {
  marketCode: string;
  units: Array<{
    askPrice: number;
    bidPrice: number;
    askSize: number;
    bidSize: number;
  }>;
  timestamp: string;
}

export interface CandleResponse {
  marketCode: string;
  openingPrice: number;
  highPrice: number;
  lowPrice: number;
  tradePrice: number;
  candleAccTradeVolume: number;
  candleDateTime: string;
}
