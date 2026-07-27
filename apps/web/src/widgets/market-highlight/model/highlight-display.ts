import { formatCoinPrice } from "@/shared";
import type { HomeHighlight } from "@dobbit/shared";

export const formatHighlightChangeRate = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;

export const getHighlightChangeClassName = (value: number) => (value >= 0 ? "text-increase" : "text-decrease");

export const getSparklinePath = (values: number[]) => {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const points = values.map((value, index) => ({
    x: values.length === 1 ? 50 : (index / (values.length - 1)) * 100,
    y: range === 0 ? 50 : 95 - ((value - min) / range) * 90,
  }));
  const firstPoint = points[0];
  if (!firstPoint) return "";
  if (points.length === 1) return `M ${firstPoint.x} ${firstPoint.y}`;
  return points.slice(1).reduce((path, point, index) => {
    const previousPoint = points[index] ?? point;
    const pointBeforePrevious = points[index - 1] ?? previousPoint;
    const pointAfterCurrent = points[index + 2] ?? point;
    const controlPoint1 = {
      x: previousPoint.x + (point.x - pointBeforePrevious.x) / 6,
      y: previousPoint.y + (point.y - pointBeforePrevious.y) / 6,
    };
    const controlPoint2 = {
      x: point.x - (pointAfterCurrent.x - previousPoint.x) / 6,
      y: point.y - (pointAfterCurrent.y - previousPoint.y) / 6,
    };
    return `${path} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${point.x} ${point.y}`;
  }, `M ${firstPoint.x} ${firstPoint.y}`);
};

export type HighlightDisplayCard = HomeHighlight & {
  changeClassName: string;
  formattedChangeRate: string;
  formattedHigh24h: string;
  formattedLow24h: string;
  formattedTradePrice: string;
  sparklinePath: string;
};

export const toHighlightDisplayCards = (highlights: HomeHighlight[]): HighlightDisplayCard[] =>
  highlights.map((item) => ({
    ...item,
    changeClassName: getHighlightChangeClassName(item.signedChangeRate),
    formattedChangeRate: formatHighlightChangeRate(item.signedChangeRate),
    formattedHigh24h: formatCoinPrice(item.high24h),
    formattedLow24h: formatCoinPrice(item.low24h),
    formattedTradePrice: formatCoinPrice(item.tradePrice),
    sparklinePath: getSparklinePath(item.sparkline),
  }));
