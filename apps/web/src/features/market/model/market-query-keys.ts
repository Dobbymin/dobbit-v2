import type { MarketListQuery } from "../api";
import type { CandleInterval } from "./libs";

export const marketKeys = {
  all: ["market"] as const,
  list: (query?: MarketListQuery) => ["market", "list", query ?? {}] as const,
  ticker: (marketCode: string) => ["market", "ticker", marketCode] as const,
  candles: (code: string, interval: CandleInterval) =>
    ["market", "candles", code, interval.type, interval.unit ?? "none"] as const,
};
