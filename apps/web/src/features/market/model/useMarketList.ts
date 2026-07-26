"use client";

import { type RefCallback, useCallback, useEffect, useMemo, useState } from "react";

import { useIntersectionObserver, useIsAuth } from "@/shared";
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

import { useFavorites } from "@/features/favorite";

import {
  type MarketListSortDirection,
  type MarketListSortKey,
  type MarketRowData,
  filterFavoriteMarkets,
  filterMarketRows,
  getTopMarketsByTradeVolume,
  getVisibleMarketRows,
  sortMarketRows,
  toMarketRow,
} from "./libs";

type MarketListTab = "all" | "favorite";

type UseMarketListParams = {
  activeTab: MarketListTab;
  markets: Market[];
  searchKeyword: string;
  tickers: Record<string, MarketTickerUpdatedEvent>;
  onSearchKeywordChange: (value: string) => void;
};

type UseMarketListResult = {
  hasNoFavorites: boolean;
  isAuthenticated: boolean;
  isFavoritesLoading: boolean;
  localSearchKeyword: string;
  observerRef: RefCallback<HTMLDivElement>;
  selectSort: (key: MarketListSortKey) => void;
  setSearchKeyword: (value: string) => void;
  sortDirection: MarketListSortDirection;
  sortKey: MarketListSortKey | null;
  sortedRows: MarketRowData[];
  visibleCount: number;
  visibleRows: MarketRowData[];
};

const ITEMS_PER_PAGE = 20;

export const useMarketList = ({
  activeTab,
  markets,
  searchKeyword,
  tickers,
  onSearchKeywordChange,
}: UseMarketListParams): UseMarketListResult => {
  const { isAuthenticated } = useIsAuth();
  const favoritesQuery = useFavorites();
  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sortKey, setSortKey] = useState<MarketListSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<MarketListSortDirection>("asc");
  const [topMarketCodes, setTopMarketCodes] = useState<string[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => onSearchKeywordChange(localSearchKeyword), 300);
    return () => clearTimeout(timer);
  }, [localSearchKeyword, onSearchKeywordChange]);

  useEffect(() => setLocalSearchKeyword(searchKeyword), [searchKeyword]);

  const favoriteMarkets = useMemo(
    () => filterFavoriteMarkets(markets, favoritesQuery.data ?? new Set()),
    [favoritesQuery.data, markets],
  );
  const hasNoFavorites = isAuthenticated && favoritesQuery.data !== undefined && favoriteMarkets.length === 0;

  useEffect(() => {
    if (activeTab !== "favorite") {
      setTopMarketCodes(null);
      return;
    }

    if (!hasNoFavorites || topMarketCodes !== null) return;

    const topMarkets = getTopMarketsByTradeVolume(markets, tickers);
    if (topMarkets.length > 0) setTopMarketCodes(topMarkets.map((market) => market.code));
  }, [activeTab, hasNoFavorites, markets, tickers, topMarketCodes]);

  const sourceMarkets = useMemo(() => {
    if (activeTab === "all") return markets;
    if (!isAuthenticated) return [];
    if (!hasNoFavorites) return favoriteMarkets;

    const marketsByCode = new Map(markets.map((market) => [market.code, market]));
    return (
      topMarketCodes?.flatMap((code) => {
        const market = marketsByCode.get(code);
        return market ? [market] : [];
      }) ?? []
    );
  }, [activeTab, favoriteMarkets, hasNoFavorites, isAuthenticated, markets, topMarketCodes]);
  const rows = useMemo(
    () => sourceMarkets.map((market) => toMarketRow(market, tickers[market.code])),
    [sourceMarkets, tickers],
  );
  const filteredRows = useMemo(() => filterMarketRows(rows, localSearchKeyword), [localSearchKeyword, rows]);
  const sortedRows = useMemo(
    () => sortMarketRows(filteredRows, tickers, sortKey, sortDirection),
    [filteredRows, sortDirection, sortKey, tickers],
  );

  const selectSort = useCallback(
    (key: MarketListSortKey) => {
      if (sortKey !== key) {
        setSortKey(key);
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection("asc");
      } else {
        setSortKey(null);
      }
    },
    [sortDirection, sortKey],
  );

  useEffect(() => setVisibleCount(ITEMS_PER_PAGE), [activeTab, localSearchKeyword, sortDirection, sortKey]);

  const loadMore = useCallback(() => {
    if (visibleCount < sortedRows.length) setVisibleCount((previous) => previous + ITEMS_PER_PAGE);
  }, [sortedRows.length, visibleCount]);
  const observerRef = useIntersectionObserver(loadMore);

  return {
    hasNoFavorites,
    isAuthenticated,
    isFavoritesLoading: favoritesQuery.isLoading,
    localSearchKeyword,
    observerRef,
    selectSort,
    setSearchKeyword: setLocalSearchKeyword,
    sortDirection,
    sortKey,
    sortedRows,
    visibleCount,
    visibleRows: getVisibleMarketRows(sortedRows, visibleCount),
  };
};
