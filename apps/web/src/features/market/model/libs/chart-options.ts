import { formatCoinPrice } from "@/shared";

import { CHART_COLORS } from "./chart-colors";
import type { ChartType } from "./chart-series";

export type BrushSelection = { min: number; max: number };

export const getBrushSelection = (timestamps: Date[]): BrushSelection | null => {
  if (timestamps.length === 0) return null;
  return {
    min: timestamps[Math.max(0, timestamps.length - 30)]!.getTime(),
    max: timestamps[timestamps.length - 1]!.getTime(),
  };
};

export const createChartOptions = (chartType: ChartType): Record<string, unknown> => ({
  chart: {
    type: chartType,
    id: "candles",
    toolbar: { autoSelected: "pan", show: false },
    zoom: { enabled: false },
    background: "transparent",
  },
  theme: { mode: "dark" },
  plotOptions: {
    candlestick: { colors: { upward: CHART_COLORS.candleUp, downward: CHART_COLORS.candleDown } },
  },
  xaxis: { type: "datetime", axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { tooltip: { enabled: true }, labels: { formatter: (value: number) => formatCoinPrice(value) } },
  grid: { borderColor: CHART_COLORS.grid },
});

export const createVolumeChartOptions = (
  timestamps: Date[],
  onSelection: (selection: BrushSelection) => void,
): Record<string, unknown> => {
  const selection = getBrushSelection(timestamps);

  return {
    chart: {
      type: "bar",
      id: "brush",
      brush: { enabled: true, target: "candles" },
      selection: {
        enabled: true,
        fill: { color: CHART_COLORS.brushFill, opacity: 0.4 },
        stroke: { color: CHART_COLORS.brushStroke },
        xaxis: selection ?? {},
      },
      events: {
        selection: (_chartContext: unknown, value: { xaxis?: BrushSelection }) => {
          if (value.xaxis?.min == null || value.xaxis.max == null) return;
          onSelection(value.xaxis);
        },
      },
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: "dark" },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    grid: { show: false },
    plotOptions: {
      bar: {
        columnWidth: "100%",
        colors: { ranges: [{ from: 0, to: 1000000000, color: CHART_COLORS.volumeBar }] },
      },
    },
    xaxis: { type: "datetime", tooltip: { enabled: false } },
    yaxis: { labels: { show: false } },
  };
};
