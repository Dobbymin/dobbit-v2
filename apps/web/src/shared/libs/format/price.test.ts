import { describe, expect, it } from "vitest";

import { formatCoinPrice } from "./price";

describe("formatCoinPrice", () => {
  it("preserves significant digits below 1 KRW", () => {
    expect(formatCoinPrice(0.000395)).toBe("0.000395");
    expect(formatCoinPrice(0.00415)).toBe("0.00415");
  });

  it("keeps existing formatting at or above 1 KRW", () => {
    expect(formatCoinPrice(1672)).toBe("1,672");
    expect(formatCoinPrice(34.567)).toBe("34.567");
  });

  it("returns zero for invalid or non-positive values", () => {
    expect(formatCoinPrice(0)).toBe("0");
    expect(formatCoinPrice(-1)).toBe("0");
    expect(formatCoinPrice(Number.NaN)).toBe("0");
    expect(formatCoinPrice(Infinity)).toBe("0");
  });

  it("retains displayed precision for sub-unit prices", () => {
    expect(formatCoinPrice(0.16)).toBe("0.16");
    expect(formatCoinPrice(0.845)).toBe("0.845");
  });
});
