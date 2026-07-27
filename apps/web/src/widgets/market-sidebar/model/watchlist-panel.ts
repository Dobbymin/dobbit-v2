import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

import { type MarketRowData, filterFavoriteMarkets, getTopMarketsByTradeVolume, toMarketRow } from "@/features/market";

const WATCHLIST_FALLBACK_LIMIT = 10;

type WatchlistRowsParams = {
  markets: Market[];
  tickers: Record<string, MarketTickerUpdatedEvent>;
  favoriteCodes: Set<string>;
  shouldShowFallback: boolean;
};

export const getWatchlistMarketSource = ({
  markets,
  tickers,
  favoriteCodes,
  shouldShowFallback,
}: WatchlistRowsParams) => {
  const favoriteMarkets = filterFavoriteMarkets(markets, favoriteCodes);

  return {
    favoriteMarkets,
    source: shouldShowFallback
      ? getTopMarketsByTradeVolume(markets, tickers, WATCHLIST_FALLBACK_LIMIT)
      : favoriteMarkets,
  };
};

type WatchlistPanelMarketDataParams = Omit<WatchlistRowsParams, "shouldShowFallback"> & {
  canShowFallback: boolean;
};

export const getWatchlistPanelMarketData = ({
  markets,
  tickers,
  favoriteCodes,
  canShowFallback,
}: WatchlistPanelMarketDataParams) => {
  const favoriteMarkets = filterFavoriteMarkets(markets, favoriteCodes);
  const hasNoFavorites = canShowFallback && favoriteMarkets.length === 0;

  return {
    hasNoFavorites,
    source: hasNoFavorites ? getTopMarketsByTradeVolume(markets, tickers, WATCHLIST_FALLBACK_LIMIT) : favoriteMarkets,
  };
};

export const getWatchlistRows = ({
  markets,
  tickers,
  favoriteCodes,
  shouldShowFallback,
}: WatchlistRowsParams): MarketRowData[] => {
  const { source } = getWatchlistMarketSource({ markets, tickers, favoriteCodes, shouldShowFallback });

  return source.map((market) => toMarketRow(market, tickers[market.code]));
};

export const getNewsHeadlines = (news: { title: string }[]) => news.map((item) => item.title).filter(Boolean);
