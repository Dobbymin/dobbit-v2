import { apiClient } from "@/shared";
import type { CandleResponse, CurrentPrice, Market, OrderbookResponse } from "@dobbit/shared";

import type { CandleInterval } from "../model/libs";
import { DEFAULT_CANDLE_INTERVAL } from "../model/libs";

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

export const getOrderbookApi = (marketCode: string): Promise<OrderbookResponse | null> =>
  apiClient<OrderbookResponse | null>(`/market/markets/${encodeURIComponent(marketCode)}/orderbook`);

export const getCandlesApi = (
  marketCode: string,
  interval: CandleInterval = DEFAULT_CANDLE_INTERVAL,
  count: number = 200,
): Promise<CandleResponse[]> => {
  const params = new URLSearchParams();
  params.set("type", interval.type);
  params.set("count", String(count));

  if (interval.unit !== undefined) {
    params.set("unit", String(interval.unit));
  }

  return apiClient<CandleResponse[]>(`/market/markets/${encodeURIComponent(marketCode)}/candles?${params.toString()}`);
};
