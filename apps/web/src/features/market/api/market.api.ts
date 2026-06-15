import { apiClient } from "@/shared";

import type { MarketTicker } from "@/entities/market";

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

export const getMarketsApi = (query?: MarketListQuery): Promise<MarketTicker[]> =>
  apiClient<MarketTicker[]>(`/markets${toQueryString(query)}`);

export const getTickerApi = (marketCode: string): Promise<MarketTicker> =>
  apiClient<MarketTicker>(`/markets/${encodeURIComponent(marketCode)}`);
