import { formatCoinPrice } from "@/shared";
import type { HomeRankingItem } from "@dobbit/shared";

export const formatTradeAmount = (value: number) => {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(1)}조`;
  return `${Math.round(value / 100_000_000).toLocaleString("ko-KR")}억`;
};

export const formatChangeRate = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;

export const getChangeClassName = (value: number) =>
  value > 0 ? "text-increase" : value < 0 ? "text-decrease" : "text-subtle-foreground";

export type RankingDisplayRow = HomeRankingItem & {
  changeClassName: string;
  formattedChangeRate: string;
  formattedTradeAmount: string;
  formattedTradePrice: string;
};

export const toRankingDisplayRows = (rows: HomeRankingItem[]): RankingDisplayRow[] =>
  rows.map((item) => ({
    ...item,
    changeClassName: getChangeClassName(item.signedChangeRate),
    formattedChangeRate: formatChangeRate(item.signedChangeRate),
    formattedTradeAmount: formatTradeAmount(item.accTradePrice24h),
    formattedTradePrice: formatCoinPrice(item.tradePrice),
  }));
