import { describe, expect, it } from "vitest";

import {
  formatChangeRate,
  formatTradeAmount,
  formatTradeVolume,
  getChangeClassName,
  getOrderbookRatio,
  toRankingDisplayRows,
} from "./ranking-display";

describe("ranking display", () => {
  it("formats change and trade amounts", () => {
    expect(formatChangeRate(0.0123)).toBe("+1.23%");
    expect(formatTradeAmount(250_000_000)).toBe("3억");
    expect(formatTradeAmount(1_250_000_000_000)).toBe("1.3조");
    expect(formatTradeVolume(1_234.56)).toBe("1,235");
  });

  it("builds presentational rows", () => {
    expect(
      toRankingDisplayRows([
        {
          rank: 1,
          marketCode: "KRW-BTC",
          koreanName: "비트코인",
          tradePrice: 1000,
          signedChangeRate: -0.01,
          accTradePrice24h: 100_000_000,
          accTradeVolume24h: 1,
        },
      ])[0],
    ).toMatchObject({
      changeClassName: "text-decrease",
      changeBadgeClassName: "bg-decrease/15 text-decrease",
      formattedTradePrice: "1,000",
      formattedChangeRate: "-1.00%",
      formattedTradeAmount: "1억",
      formattedTradeVolume: "1",
    });
    expect(getChangeClassName(0)).toBe("text-subtle-foreground");
  });

  it("calculates bid and ask ratios safely", () => {
    expect(getOrderbookRatio([{ askPrice: 1, askSize: 3, bidPrice: 1, bidSize: 7 }])).toEqual({
      askPercent: 30,
      bidPercent: 70,
    });
    expect(getOrderbookRatio([{ askPrice: 1, askSize: 8, bidPrice: 1, bidSize: 2 }])).toEqual({
      askPercent: 80,
      bidPercent: 20,
    });
    expect(getOrderbookRatio([{ askPrice: 1, askSize: 0, bidPrice: 1, bidSize: 5 }])).toEqual({
      askPercent: 0,
      bidPercent: 100,
    });
    expect(getOrderbookRatio([{ askPrice: 1, askSize: 0, bidPrice: 1, bidSize: 0 }])).toEqual({
      askPercent: 50,
      bidPercent: 50,
    });
  });
});
