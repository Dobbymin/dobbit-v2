import { describe, expect, it } from "vitest";

import { calculateOrderAmount, calculateOrderTotal } from "./order-calculation";

describe("order calculation", () => {
  it("calculates rounded order total", () => {
    expect(calculateOrderTotal("1234.5", "2.5")).toBe("3086");
  });

  it("calculates order amount", () => {
    expect(calculateOrderAmount("2500", "10000")).toBe("4");
  });

  it("returns empty string for empty or invalid values", () => {
    expect(calculateOrderTotal("", "2")).toBe("");
    expect(calculateOrderTotal("price", "2")).toBe("");
    expect(calculateOrderTotal("0", "2")).toBe("");
    expect(calculateOrderAmount("0", "10000")).toBe("");
    expect(calculateOrderAmount("1000", "total")).toBe("");
  });
});
