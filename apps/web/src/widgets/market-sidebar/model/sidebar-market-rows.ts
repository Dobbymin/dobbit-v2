import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

import { type MarketRowData, getTopMarketsByTradeVolume, toMarketRow } from "@/features/market";

const SEARCH_RESULT_LIMIT = 50;
const REALTIME_RANKING_LIMIT = 30;

export const getSidebarSearchRows = (
  markets: Market[],
  tickers: Record<string, MarketTickerUpdatedEvent>,
  searchKeyword: string,
): MarketRowData[] => {
  const keyword = searchKeyword.trim().toLowerCase();
  if (!keyword) return [];

  return markets
    .filter(
      (market) =>
        market.code.toLowerCase().includes(keyword) ||
        market.koreanName.toLowerCase().includes(keyword) ||
        market.symbol.toLowerCase().includes(keyword),
    )
    .slice(0, SEARCH_RESULT_LIMIT)
    .map((market) => toMarketRow(market, tickers[market.code]));
};

export const getRecentlyViewedRows = (
  codes: string[],
  markets: Market[],
  tickers: Record<string, MarketTickerUpdatedEvent>,
): MarketRowData[] => {
  const marketByCode = new Map(markets.map((market) => [market.code, market]));

  return codes.flatMap((code) => {
    const market = marketByCode.get(code);
    return market ? [toMarketRow(market, tickers[code])] : [];
  });
};

export const getRealtimeRankingRows = (
  markets: Market[],
  tickers: Record<string, MarketTickerUpdatedEvent>,
): MarketRowData[] =>
  getTopMarketsByTradeVolume(markets, tickers, REALTIME_RANKING_LIMIT).map((market) =>
    toMarketRow(market, tickers[market.code]),
  );
