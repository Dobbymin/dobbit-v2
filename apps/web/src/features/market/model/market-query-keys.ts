import type { MarketListQuery } from "../api";

export const marketKeys = {
  all: ["market"] as const,
  list: (query?: MarketListQuery) => ["market", "list", query ?? {}] as const,
  ticker: (marketCode: string) => ["market", "ticker", marketCode] as const,
};
