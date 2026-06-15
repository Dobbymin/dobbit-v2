import type { CandleResponse } from "@dobbit/shared";
import { describe, expect, it } from "vitest";

import { toCandleSeries, updateLastCandleWithTicker } from "../src/features/market/model/libs/candle-series";

describe("toCandleSeries", () => {
  const mockCandles: CandleResponse[] = [
    {
      marketCode: "KRW-BTC",
      openingPrice: 100,
      highPrice: 110,
      lowPrice: 90,
      tradePrice: 105,
      candleAccTradeVolume: 1000,
      candleDateTime: "2026-06-15T10:00:00Z",
    },
    {
      marketCode: "KRW-BTC",
      openingPrice: 105,
      highPrice: 115,
      lowPrice: 100,
      tradePrice: 110,
      candleAccTradeVolume: 1500,
      candleDateTime: "2026-06-15T11:00:00Z",
    },
    {
      marketCode: "KRW-BTC",
      openingPrice: 110,
      highPrice: 120,
      lowPrice: 105,
      tradePrice: 115,
      candleAccTradeVolume: 2000,
      candleDateTime: "2026-06-15T12:00:00Z",
    },
  ];

  it("should convert CandleResponse[] to ApexCharts series format", () => {
    const series = toCandleSeries(mockCandles);

    expect(series).toHaveLength(3);
    expect(series[0]).toEqual({
      x: new Date("2026-06-15T10:00:00Z"),
      y: [100, 110, 90, 105],
    });
    expect(series[1]).toEqual({
      x: new Date("2026-06-15T11:00:00Z"),
      y: [105, 115, 100, 110],
    });
    expect(series[2]).toEqual({
      x: new Date("2026-06-15T12:00:00Z"),
      y: [110, 120, 105, 115],
    });
  });

  it("should parse candleDateTime as Date", () => {
    const series = toCandleSeries(mockCandles);

    series.forEach((candle, index) => {
      expect(candle.x instanceof Date).toBe(true);
      expect(candle.x.getTime()).toBe(new Date(mockCandles[index]!.candleDateTime).getTime());
    });
  });

  it("should return y array with [open, high, low, close]", () => {
    const series = toCandleSeries(mockCandles);

    series.forEach((candle, index) => {
      const [open, high, low, close] = candle.y;
      const mock = mockCandles[index]!;

      expect(open).toBe(mock.openingPrice);
      expect(high).toBe(mock.highPrice);
      expect(low).toBe(mock.lowPrice);
      expect(close).toBe(mock.tradePrice);
    });
  });

  it("should handle empty array", () => {
    const series = toCandleSeries([]);
    expect(series).toEqual([]);
  });
});

describe("updateLastCandleWithTicker", () => {
  const mockSeries = [
    {
      x: new Date("2026-06-15T10:00:00Z"),
      y: [100, 110, 90, 105] as [number, number, number, number],
    },
    {
      x: new Date("2026-06-15T11:00:00Z"),
      y: [105, 115, 100, 110] as [number, number, number, number],
    },
    {
      x: new Date("2026-06-15T12:00:00Z"),
      y: [110, 120, 105, 115] as [number, number, number, number],
    },
  ];

  it("should update last candle close price with tradePrice", () => {
    const tradePrice = 120;
    const updated = updateLastCandleWithTicker(mockSeries, tradePrice);

    expect(updated[2]!.y[3]).toBe(tradePrice); // close = tradePrice
  });

  it("should update high if tradePrice is higher", () => {
    const tradePrice = 125;
    const updated = updateLastCandleWithTicker(mockSeries, tradePrice);

    expect(updated[2]!.y[1]).toBe(125); // high = max(120, 125) = 125
  });

  it("should not update high if tradePrice is lower", () => {
    const tradePrice = 110;
    const updated = updateLastCandleWithTicker(mockSeries, tradePrice);

    expect(updated[2]!.y[1]).toBe(120); // high unchanged
  });

  it("should update low if tradePrice is lower", () => {
    const tradePrice = 100;
    const updated = updateLastCandleWithTicker(mockSeries, tradePrice);

    expect(updated[2]!.y[2]).toBe(100); // low = min(105, 100) = 100
  });

  it("should not update low if tradePrice is higher", () => {
    const tradePrice = 110;
    const updated = updateLastCandleWithTicker(mockSeries, tradePrice);

    expect(updated[2]!.y[2]).toBe(105); // low unchanged
  });

  it("should preserve series length", () => {
    const updated = updateLastCandleWithTicker(mockSeries, 120);
    expect(updated).toHaveLength(mockSeries.length || 0);
  });

  it("should not mutate original series", () => {
    const original = JSON.stringify(mockSeries);
    updateLastCandleWithTicker(mockSeries, 120);
    expect(JSON.stringify(mockSeries)).toBe(original);
  });

  it("should handle empty series", () => {
    const updated = updateLastCandleWithTicker([], 120);
    expect(updated).toEqual([]);
  });

  it("should keep other candles unchanged", () => {
    const updated = updateLastCandleWithTicker(mockSeries, 120);

    expect(updated[0]).toEqual(mockSeries[0]);
    expect(updated[1]).toEqual(mockSeries[1]);
  });
});
