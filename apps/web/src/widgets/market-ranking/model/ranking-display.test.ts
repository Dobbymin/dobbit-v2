import { describe, expect, it } from "vitest";

import { formatChangeRate, formatTradeAmount, getChangeClassName, toRankingDisplayRows } from "./ranking-display";

describe("ranking display", () => {
  it("formats change and trade amounts", () => {
    expect(formatChangeRate(0.0123)).toBe("+1.23%");
    expect(formatTradeAmount(250_000_000)).toBe("3억");
    expect(formatTradeAmount(1_250_000_000_000)).toBe("1.3조");
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
      formattedTradePrice: "1,000",
      formattedChangeRate: "-1.00%",
      formattedTradeAmount: "1억",
    });
    expect(getChangeClassName(0)).toBe("text-subtle-foreground");
  });
});
