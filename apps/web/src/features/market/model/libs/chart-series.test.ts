import type { CandleResponse } from "@dobbit/shared";
import { describe, expect, it } from "vitest";

import { createChartSeries, createVolumeChartOptions, getBrushSelection } from "./index";

const candles: CandleResponse[] = Array.from({ length: 60 }, (_, index) => ({
  marketCode: "KRW-BTC",
  openingPrice: 100 + index,
  highPrice: 101 + index,
  lowPrice: 99 + index,
  tradePrice: 100 + index,
  candleAccTradeVolume: index + 1,
  candleDateTime: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
}));

describe("chart series", () => {
  it("builds candlestick series with ticker update", () => {
    const series = createChartSeries(candles, "candlestick", { tradePrice: 999 } as never, false);
    expect(series).toHaveLength(1);
    expect(series[0]!.name).toBe("Candle");
    expect(series[0]!.data).toHaveLength(60);
    expect((series[0]!.data as Array<{ y: number[] }>)[59]!.y).toEqual([159, 999, 99 + 59, 999]);
  });

  it("adds all moving average series with null values before period", () => {
    const series = createChartSeries(candles, "line", null, true);
    expect(series.map((item) => item.name)).toEqual(["Price", "MA7", "MA20", "MA60"]);
    expect((series[1]!.data as Array<{ y: number | null }>)[5]!.y).toBeNull();
    expect((series[1]!.data as Array<{ y: number | null }>)[6]!.y).toBe(103);
    expect((series[3]!.data as Array<{ y: number | null }>)[58]!.y).toBeNull();
    expect((series[3]!.data as Array<{ y: number | null }>)[59]!.y).toBe(129.5);
  });

  it("keeps only main series when no candles exist", () => {
    const series = createChartSeries([], "line", { tradePrice: 999 } as never, true);
    expect(series).toEqual([{ name: "Price", type: "line", data: [] }]);
  });
});

describe("volume brush options", () => {
  it("uses last 30 timestamps for initial brush selection", () => {
    const timestamps = candles.map((candle) => new Date(candle.candleDateTime));
    expect(getBrushSelection(timestamps)).toEqual({
      min: timestamps[30]!.getTime(),
      max: timestamps[59]!.getTime(),
    });
    expect(getBrushSelection([])).toBeNull();
  });

  it("selects last 30 points and forwards brush events", () => {
    const selected: Array<{ min: number; max: number }> = [];
    const options = createVolumeChartOptions(
      candles.map((candle) => new Date(candle.candleDateTime)),
      (value) => selected.push(value),
    );
    const chart = options.chart as {
      selection: { xaxis: { min: number; max: number } };
      events: { selection: (context: unknown, value: { xaxis: { min: number; max: number } }) => void };
    };
    expect(chart.selection.xaxis.min).toBe(new Date(candles[30]!.candleDateTime).getTime());
    chart.events.selection(null, { xaxis: { min: 1, max: 2 } });
    expect(selected).toEqual([{ min: 1, max: 2 }]);
  });
});
