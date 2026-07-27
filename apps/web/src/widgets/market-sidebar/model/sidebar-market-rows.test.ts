import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { describe, expect, it } from "vitest";

import { getRealtimeRankingRows, getRecentlyViewedRows, getSidebarSearchRows } from "./sidebar-market-rows";

const market = (code: string, koreanName = code): Market => ({
  id: code,
  code,
  koreanName,
  englishName: code,
  symbol: code.replace("KRW-", ""),
  isActive: true,
});

const ticker = (marketCode: string, accTradeVolume24h: number, tradePrice = 100): MarketTickerUpdatedEvent => ({
  type: "market.ticker.updated",
  marketCode,
  accTradeVolume24h,
  tradePrice,
  signedChangeRate: 0,
  signedChangePrice: 0,
  timestamp: "2026-07-26T00:00:00.000Z",
});

describe("sidebar market rows", () => {
  const markets = [market("KRW-BTC", "비트코인"), market("KRW-ETH", "이더리움"), market("KRW-XRP", "리플")];
  const tickers = {
    "KRW-BTC": ticker("KRW-BTC", 1),
    "KRW-ETH": ticker("KRW-ETH", 3),
    "KRW-XRP": ticker("KRW-XRP", 2),
  };

  it("searches code, Korean name, and symbol without a result for blank input", () => {
    expect(getSidebarSearchRows(markets, tickers, "")).toEqual([]);
    expect(getSidebarSearchRows(markets, tickers, "이더").map((row) => row.code)).toEqual(["KRW-ETH"]);
    expect(getSidebarSearchRows(markets, tickers, "xrp").map((row) => row.code)).toEqual(["KRW-XRP"]);
  });

  it("keeps recently viewed code order and skips unavailable markets", () => {
    expect(
      getRecentlyViewedRows(["KRW-XRP", "KRW-MISSING", "KRW-BTC"], markets, tickers).map((row) => row.code),
    ).toEqual(["KRW-XRP", "KRW-BTC"]);
  });

  it("ranks rows by approximate trade amount", () => {
    expect(getRealtimeRankingRows(markets, tickers).map((row) => row.code)).toEqual(["KRW-ETH", "KRW-XRP", "KRW-BTC"]);
  });

  it("limits search results to fifty and realtime rankings to thirty", () => {
    const manyMarkets = Array.from({ length: 51 }, (_, index) => market(`KRW-COIN${index}`));
    const manyTickers = Object.fromEntries(manyMarkets.map((item, index) => [item.code, ticker(item.code, index + 1)]));

    expect(getSidebarSearchRows(manyMarkets, manyTickers, "coin")).toHaveLength(50);
    expect(getRealtimeRankingRows(manyMarkets, manyTickers)).toHaveLength(30);
  });
});
