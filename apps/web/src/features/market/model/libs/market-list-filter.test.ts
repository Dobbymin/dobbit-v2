import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { describe, expect, it } from "vitest";

import { filterFavoriteMarkets, getTopMarketsByTradeVolume } from "./market-list-filter";
import { filterMarketRows, getVisibleMarketRows, sortMarketRows } from "./market-list-view-model";
import type { MarketRowData } from "./market-row";

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

  it("검색어로 코드, 한글명, 심볼 쌍을 필터한다", () => {
    const rows: MarketRowData[] = [
      {
        code: "KRW-BTC",
        koreanName: "비트코인",
        symbolPair: "BTC/KRW",
        tradePrice: "-",
        changeRate: "-",
        changeTone: "neutral",
        isActive: true,
      },
      {
        code: "KRW-ETH",
        koreanName: "이더리움",
        symbolPair: "ETH/KRW",
        tradePrice: "-",
        changeRate: "-",
        changeTone: "neutral",
        isActive: true,
      },
    ] as const;

    expect(filterMarketRows([...rows], " btc ")).toEqual([rows[0]]);
    expect(filterMarketRows([...rows], "이더")).toEqual([rows[1]]);
  });

  it("문자와 숫자 값을 선택한 방향으로 정렬한다", () => {
    const rows: MarketRowData[] = [
      {
        code: "KRW-BTC",
        koreanName: "비트코인",
        symbolPair: "BTC/KRW",
        tradePrice: "-",
        changeRate: "-",
        changeTone: "neutral",
        isActive: true,
      },
      {
        code: "KRW-ETH",
        koreanName: "이더리움",
        symbolPair: "ETH/KRW",
        tradePrice: "-",
        changeRate: "-",
        changeTone: "neutral",
        isActive: true,
      },
    ];
    const tickers = {
      "KRW-BTC": ticker("KRW-BTC", 1, 100),
      "KRW-ETH": ticker("KRW-ETH", 1, 200),
    };

    expect(sortMarketRows(rows, tickers, "price", "desc").map((row) => row.code)).toEqual(["KRW-ETH", "KRW-BTC"]);
    expect(sortMarketRows(rows, tickers, "market", "asc").map((row) => row.code)).toEqual(["KRW-BTC", "KRW-ETH"]);
  });

  it("visible count만큼 목록을 자른다", () => {
    const rows = Array.from({ length: 3 }, (_, index) => ({ code: `KRW-${index}` })) as MarketRowData[];

    expect(getVisibleMarketRows(rows, 2)).toEqual(rows.slice(0, 2));
  });
});
