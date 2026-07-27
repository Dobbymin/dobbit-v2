import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { describe, expect, it } from "vitest";

import { getNewsHeadlines, getWatchlistRows } from "./watchlist-panel";

const market = (code: string): Market => ({
  id: code,
  code,
  koreanName: code,
  englishName: code,
  symbol: code.replace("KRW-", ""),
  isActive: true,
});

const ticker = (marketCode: string, accTradeVolume24h: number): MarketTickerUpdatedEvent => ({
  type: "market.ticker.updated",
  marketCode,
  accTradeVolume24h,
  tradePrice: 100,
  signedChangeRate: 0,
  signedChangePrice: 0,
  timestamp: "2026-07-26T00:00:00.000Z",
});

describe("watchlist panel rows", () => {
  const markets = [market("KRW-BTC"), market("KRW-ETH"), market("KRW-XRP")];
  const tickers = {
    "KRW-BTC": ticker("KRW-BTC", 1),
    "KRW-ETH": ticker("KRW-ETH", 3),
    "KRW-XRP": ticker("KRW-XRP", 2),
  };

  it("maps favorite markets to ticker rows", () => {
    expect(
      getWatchlistRows({ markets, tickers, favoriteCodes: new Set(["KRW-XRP"]), shouldShowFallback: false }).map(
        (row) => row.code,
      ),
    ).toEqual(["KRW-XRP"]);
  });

  it("uses top trade-volume markets for empty favorite fallback", () => {
    expect(
      getWatchlistRows({ markets, tickers, favoriteCodes: new Set(), shouldShowFallback: true }).map((row) => row.code),
    ).toEqual(["KRW-ETH", "KRW-XRP", "KRW-BTC"]);
  });
});

describe("news headlines", () => {
  it("keeps only non-empty titles", () => {
    expect(getNewsHeadlines([{ title: "첫 뉴스" }, { title: "" }])).toEqual(["첫 뉴스"]);
  });
});
