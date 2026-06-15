import { apiClient } from "@/shared";
import type { CandleResponse, CurrentPrice, Market } from "@dobbit/shared";

export type MarketListQuery = {
  quote?: "KRW";
  search?: string;
  onlyActive?: boolean;
};

const toQueryString = (query?: MarketListQuery) => {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  if (query.quote) params.set("quote", query.quote);
  if (query.search) params.set("search", query.search);
  if (typeof query.onlyActive === "boolean") params.set("onlyActive", String(query.onlyActive));

  const value = params.toString();
  return value ? `?${value}` : "";
};

export const getMarketsApi = (query?: MarketListQuery): Promise<Market[]> =>
  apiClient<Market[]>(`/market/markets${toQueryString(query)}`);

export const getTickerApi = (marketCode: string): Promise<CurrentPrice | null> =>
  apiClient<CurrentPrice | null>(`/market/markets/${encodeURIComponent(marketCode)}/price`);

export const getCandlesApi = (marketCode: string, unit: number = 1, count: number = 200): Promise<CandleResponse[]> =>
  apiClient<CandleResponse[]>(`/market/markets/${encodeURIComponent(marketCode)}/candles?unit=${unit}&count=${count}`);
