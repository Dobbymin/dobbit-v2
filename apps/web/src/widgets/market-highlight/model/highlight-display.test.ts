import { describe, expect, it } from "vitest";

import { getSparklinePath, toHighlightDisplayCards } from "./highlight-display";

describe("highlight display", () => {
  it("creates empty, single, and curved sparkline paths", () => {
    expect(getSparklinePath([])).toBe("");
    expect(getSparklinePath([7])).toBe("M 50 50");
    expect(getSparklinePath([1, 2])).toContain(" C ");
  });

  it("builds formatted display cards", () => {
    expect(
      toHighlightDisplayCards([
        {
          marketCode: "KRW-BTC",
          koreanName: "비트코인",
          tradePrice: 1000,
          signedChangeRate: 0.01,
          high24h: 1100,
          low24h: 900,
          sparkline: [1, 2],
        },
      ])[0],
    ).toMatchObject({
      changeClassName: "text-increase",
      formattedChangeRate: "+1.00%",
      formattedHigh24h: "1,100",
      formattedLow24h: "900",
      formattedTradePrice: "1,000",
    });
  });
});
