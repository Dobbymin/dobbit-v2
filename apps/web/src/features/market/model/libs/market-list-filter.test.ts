import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { describe, expect, it } from "vitest";

import { filterFavoriteMarkets, getTopMarketsByTradeVolume } from "./market-list-filter";

const market = (code: string): Market => ({
  id: code,
  code,
  koreanName: code,
  englishName: code,
  symbol: code.replace("KRW-", ""),
  isActive: true,
});

const ticker = (marketCode: string, accTradeVolume24h: number, tradePrice: number): MarketTickerUpdatedEvent => ({
  type: "market.ticker.updated",
  marketCode,
  accTradeVolume24h,
  tradePrice,
  signedChangeRate: 0,
  signedChangePrice: 0,
  timestamp: "2026-07-19T00:00:00.000Z",
});

describe("market list filter", () => {
  it("관심 목록에 있는 마켓만 필터한다", () => {
    const markets = [market("KRW-BTC"), market("KRW-ETH"), market("KRW-XRP")];

    expect(filterFavoriteMarkets(markets, new Set(["KRW-ETH"]))).toEqual([markets[1]]);
  });

  it("관심이 없을 때 거래대금 근사값 상위 10개를 노출한다", () => {
    const markets = Array.from({ length: 11 }, (_, index) => market(`KRW-COIN${index}`));
    const tickers = Object.fromEntries(markets.map((item, index) => [item.code, ticker(item.code, index + 1, 100)]));

    const result = getTopMarketsByTradeVolume(markets, tickers);

    expect(result).toHaveLength(10);
    expect(result.map((item) => item.code)).toEqual(
      markets
        .slice(1)
        .reverse()
        .map((item) => item.code),
    );
  });
});
