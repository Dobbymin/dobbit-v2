import type { CandleResponse, CurrentPrice, MarketTickerUpdatedEvent } from "@dobbit/shared";

import {
  toCandleSeries,
  toLineSeries,
  toVolumeSeries,
  updateLastCandleWithTicker,
  updateLastLinePointWithTicker,
} from "./candle-series";
import { CHART_COLORS } from "./chart-colors";
import { calculateSMA } from "./sma-calculator";

export type ChartType = "candlestick" | "line";
type Ticker = CurrentPrice | MarketTickerUpdatedEvent | null | undefined;

export const createMainChartSeries = (candles: CandleResponse[], chartType: ChartType, ticker: Ticker) => {
  if (chartType === "candlestick") {
    const series = toCandleSeries(candles);
    return ticker ? updateLastCandleWithTicker(series, ticker.tradePrice) : series;
  }

  const series = toLineSeries(candles);
  return ticker ? updateLastLinePointWithTicker(series, ticker.tradePrice) : series;
};

export const createChartSeries = (
  candles: CandleResponse[],
  chartType: ChartType,
  ticker: Ticker,
  showMovingAverages: boolean,
) => {
  const series: Array<Record<string, unknown>> = [
    {
      name: chartType === "candlestick" ? "Candle" : "Price",
      type: chartType,
      data: createMainChartSeries(candles, chartType, ticker),
    },
  ];

  if (!showMovingAverages || candles.length === 0) return series;

  const prices = candles.map((candle) => candle.tradePrice);
  const movingAverages = [
    { name: "MA7", values: calculateSMA(prices, 7), color: CHART_COLORS.ma7 },
    { name: "MA20", values: calculateSMA(prices, 20), color: CHART_COLORS.ma20 },
    { name: "MA60", values: calculateSMA(prices, 60), color: CHART_COLORS.ma60 },
  ];

  for (const movingAverage of movingAverages) {
    series.push({
      name: movingAverage.name,
      type: "line",
      data: candles.map((candle, index) => ({
        x: new Date(candle.candleDateTime),
        y: movingAverage.values[index],
      })),
      stroke: { width: 1, colors: [movingAverage.color] },
    });
  }

  return series;
};

export const createVolumeSeries = (candles: CandleResponse[]) => [
  { name: "Volume", type: "bar", data: toVolumeSeries(candles) },
];
