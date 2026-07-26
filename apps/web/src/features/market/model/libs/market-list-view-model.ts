import type { MarketTickerUpdatedEvent } from "@dobbit/shared";

import type { MarketRowData } from "./market-row";

export type MarketListSortKey = "market" | "price" | "changeRate";
export type MarketListSortDirection = "asc" | "desc";

export const filterMarketRows = (rows: MarketRowData[], searchKeyword: string) => {
  const keyword = searchKeyword.trim().toLowerCase();
  if (!keyword) return rows;

  return rows.filter(
    (row) =>
      row.code.toLowerCase().includes(keyword) ||
      row.koreanName.toLowerCase().includes(keyword) ||
      row.symbolPair.toLowerCase().includes(keyword),
  );
};

export const sortMarketRows = (
  rows: MarketRowData[],
  tickers: Record<string, MarketTickerUpdatedEvent>,
  sortKey: MarketListSortKey | null,
  sortDirection: MarketListSortDirection,
) => {
  if (sortKey === null) return rows;

  return [...rows].sort((a, b) => {
    if (sortKey === "market") {
      const comparison = a.koreanName.localeCompare(b.koreanName, "ko");
      return sortDirection === "desc" ? -comparison : comparison;
    }

    const aValue = sortKey === "price" ? tickers[a.code]?.tradePrice : tickers[a.code]?.signedChangeRate;
    const bValue = sortKey === "price" ? tickers[b.code]?.tradePrice : tickers[b.code]?.signedChangeRate;
    if (typeof aValue !== "number" || !Number.isFinite(aValue)) {
      return typeof bValue === "number" && Number.isFinite(bValue) ? 1 : 0;
    }
    if (typeof bValue !== "number" || !Number.isFinite(bValue)) return -1;
    return sortDirection === "desc" ? bValue - aValue : aValue - bValue;
  });
};

export const getVisibleMarketRows = (rows: MarketRowData[], visibleCount: number) => rows.slice(0, visibleCount);
