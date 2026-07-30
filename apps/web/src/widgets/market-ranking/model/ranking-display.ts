import { formatCoinPrice } from "@/shared";
import type { HomeRankingItem, OrderbookResponse } from "@dobbit/shared";

export const formatTradeAmount = (value: number) => {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(1)}조`;
  return `${Math.round(value / 100_000_000).toLocaleString("ko-KR")}억`;
};

export const formatChangeRate = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;

export const getChangeClassName = (value: number) =>
  value > 0 ? "text-increase" : value < 0 ? "text-decrease" : "text-subtle-foreground";

export const getChangeBadgeClassName = (value: number) =>
  value > 0
    ? "bg-increase/15 text-increase"
    : value < 0
      ? "bg-decrease/15 text-decrease"
      : "bg-surface-sunken text-subtle-foreground";

export const formatTradeVolume = (value: number) => value.toLocaleString("ko-KR", { maximumFractionDigits: 0 });

export const getOrderbookRatio = (units: OrderbookResponse["units"] = []) => {
  const { askSize, bidSize } = units.reduce(
    (total, unit) => ({ askSize: total.askSize + unit.askSize, bidSize: total.bidSize + unit.bidSize }),
    { askSize: 0, bidSize: 0 },
  );
  const total = bidSize + askSize;

  if (total === 0) return { askPercent: 50, bidPercent: 50 };

  return {
    askPercent: Math.round((askSize / total) * 100),
    bidPercent: Math.round((bidSize / total) * 100),
  };
};

export type RankingDisplayRow = HomeRankingItem & {
  changeBadgeClassName: string;
  changeClassName: string;
  formattedChangeRate: string;
  formattedTradeAmount: string;
  formattedTradePrice: string;
  formattedTradeVolume: string;
};

export const toRankingDisplayRows = (rows: HomeRankingItem[]): RankingDisplayRow[] =>
  rows.map((item) => ({
    ...item,
    changeBadgeClassName: getChangeBadgeClassName(item.signedChangeRate),
    changeClassName: getChangeClassName(item.signedChangeRate),
    formattedChangeRate: formatChangeRate(item.signedChangeRate),
    formattedTradeAmount: formatTradeAmount(item.accTradePrice24h),
    formattedTradePrice: formatCoinPrice(item.tradePrice),
    formattedTradeVolume: formatTradeVolume(item.accTradeVolume24h),
  }));
