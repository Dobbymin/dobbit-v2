"use client";

import Link from "next/link";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Input, ROUTES_PATH, Skeleton, cn, useIntersectionObserver, useIsAuth } from "@/shared";
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { ArrowDown, ArrowUp, ArrowUpDown, Heart, Search } from "lucide-react";

import { FavoriteButton, useFavorites } from "@/features/favorite";

import { CoinIcon } from "@/entities/market";

import { filterFavoriteMarkets, getTopMarketsByTradeVolume, toMarketRow } from "../model";

type MarketListTab = "all" | "favorite";

type MarketListPanelProps = {
  activeTab: MarketListTab;
  markets: Market[];
  selectedMarketCode: string;
  searchKeyword: string;
  isLoading: boolean;
  showTabs?: boolean;
  tickers: Record<string, MarketTickerUpdatedEvent>;
  onActiveTabChange: (tab: MarketListTab) => void;
  onSearchKeywordChange: (value: string) => void;
};

type SortKey = "market" | "price" | "changeRate";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 20;

export const MarketListPanel = ({
  activeTab,
  markets,
  selectedMarketCode,
  searchKeyword,
  isLoading,
  showTabs = true,
  tickers,
  onActiveTabChange,
  onSearchKeywordChange,
}: MarketListPanelProps) => {
  const { isAuthenticated } = useIsAuth();
  const favoritesQuery = useFavorites();
  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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
    if (activeTab === "all") {
      return markets;
    }

    if (!isAuthenticated) {
      return [];
    }

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

  const filteredRows = useMemo(() => {
    const keyword = localSearchKeyword.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter(
      (row) =>
        row.code.toLowerCase().includes(keyword) ||
        row.koreanName.toLowerCase().includes(keyword) ||
        row.symbolPair.toLowerCase().includes(keyword),
    );
  }, [localSearchKeyword, rows]);

  const sortedRows = useMemo(() => {
    if (sortKey === null) return filteredRows;

    return [...filteredRows].sort((a, b) => {
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
  }, [filteredRows, sortDirection, sortKey, tickers]);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortDirection("asc");
    } else {
      setSortKey(null);
    }
  };

  const getAriaLabelForSort = (key: SortKey, headerName: string) => {
    if (sortKey !== key) return `${headerName} 기준 내림차순 정렬`;
    if (sortDirection === "desc") return `${headerName} 기준 내림차순 정렬됨. 오름차순으로 변경`;
    return `${headerName} 기준 오름차순 정렬됨. 정렬 해제`;
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown aria-hidden='true' size={12} />;
    return sortDirection === "asc" ? (
      <ArrowUp aria-hidden='true' size={12} />
    ) : (
      <ArrowDown aria-hidden='true' size={12} />
    );
  };

  useEffect(() => setVisibleCount(ITEMS_PER_PAGE), [activeTab, localSearchKeyword, sortDirection, sortKey]);

  const observerRef = useIntersectionObserver(
    useCallback(() => {
      if (visibleCount < sortedRows.length) setVisibleCount((previous) => previous + ITEMS_PER_PAGE);
    }, [sortedRows.length, visibleCount]),
  );
  const visibleRows = sortedRows.slice(0, visibleCount);
  const showLoginPrompt = activeTab === "favorite" && !isAuthenticated;

  return (
    <aside className='flex min-h-[520px] flex-col border-r border-border bg-background lg:h-full lg:min-h-0 lg:overflow-hidden'>
      <div className='border-b border-border p-4'>
        {showTabs ? (
          <div className='mb-3 grid grid-cols-2 rounded-lg bg-surface-sunken p-1'>
            {(
              [
                ["all", "전체"],
                ["favorite", "관심"],
              ] as const
            ).map(([tab, label]) => (
              <button
                aria-pressed={activeTab === tab}
                className={cn(
                  "h-8 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab ? "bg-card text-foreground" : "text-subtle-foreground",
                )}
                key={tab}
                onClick={() => onActiveTabChange(tab)}
                type='button'
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
        <div className='relative'>
          <Input
            aria-label='마켓 검색'
            className='h-10 rounded-lg border-none bg-card pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40'
            onChange={(event) => setLocalSearchKeyword(event.target.value)}
            placeholder='코인명 / 심볼 검색'
            value={localSearchKeyword}
          />
          <Search className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground' size={16} />
        </div>
        {isLoading ? (
          <span aria-live='polite' className='sr-only'>
            마켓 동기화 중
          </span>
        ) : null}
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_76px] items-start gap-3 bg-background/80 px-4 py-3 text-xs font-medium text-muted-foreground backdrop-blur-sm'>
          <button
            aria-label={getAriaLabelForSort("market", "마켓")}
            className='flex items-center gap-1 text-left'
            onClick={() => handleSort("market")}
            type='button'
          >
            마켓
            {renderSortIcon("market")}
          </button>
          <div className='flex flex-col items-end gap-0.5'>
            {(
              [
                ["price", "현재가"],
                ["changeRate", "변동률"],
              ] as const
            ).map(([key, label]) => (
              <button
                aria-label={getAriaLabelForSort(key, label)}
                className='flex items-center justify-end gap-1 text-right'
                key={key}
                onClick={() => handleSort(key)}
                type='button'
              >
                {label}
                {renderSortIcon(key)}
              </button>
            ))}
          </div>
        </div>
        {showLoginPrompt ? (
          <div className='flex flex-col items-center gap-3 px-4 py-10 text-center'>
            <Heart aria-hidden='true' className='text-subtle-foreground' size={24} />
            <p className='text-sm text-muted-foreground'>로그인하고 관심 코인을 모아보세요.</p>
            <Button asChild size='sm'>
              <Link href={ROUTES_PATH.LOGIN}>로그인</Link>
            </Button>
          </div>
        ) : favoritesQuery.isLoading && activeTab === "favorite" ? (
          <div className='space-y-1'>
            {Array.from({ length: 7 }).map((_, index) => (
              <div className='grid h-[52px] grid-cols-[minmax(0,1fr)_76px] items-center gap-3 px-4' key={index}>
                <Skeleton className='h-7 w-32' />
                <div className='flex flex-col items-end gap-0.5'>
                  <Skeleton className='h-3.5 w-16' />
                  <Skeleton className='h-3 w-10' />
                </div>
              </div>
            ))}
          </div>
        ) : isLoading && sortedRows.length === 0 ? (
          <div className='space-y-1'>
            {Array.from({ length: 7 }).map((_, index) => (
              <div className='grid h-[52px] grid-cols-[minmax(0,1fr)_76px] items-center gap-3 px-4' key={index}>
                <Skeleton className='h-7 w-32' />
                <div className='flex flex-col items-end gap-0.5'>
                  <Skeleton className='h-3.5 w-16' />
                  <Skeleton className='h-3 w-10' />
                </div>
              </div>
            ))}
          </div>
        ) : sortedRows.length === 0 ? (
          <p className='px-4 py-8 text-sm text-muted-foreground'>검색 결과가 없습니다.</p>
        ) : (
          <>
            {hasNoFavorites ? (
              <p className='px-4 pt-3 text-xs text-muted-foreground'>거래대금이 높은 코인을 살펴보세요.</p>
            ) : null}
            {visibleRows.map((row) => {
              const active = row.code === selectedMarketCode;
              const tone =
                row.changeTone === "increase"
                  ? "text-increase"
                  : row.changeTone === "decrease"
                    ? "text-decrease"
                    : "text-change-neutral";

              return (
                <div
                  className={cn(
                    "grid h-[52px] w-full grid-cols-[auto_1fr] items-center gap-2 border-l-2 px-4 transition-colors",
                    active ? "border-l-primary bg-surface-sunken" : "border-l-transparent",
                  )}
                  key={row.code}
                >
                  <FavoriteButton marketCode={row.code} />
                  <Link
                    className='grid h-full min-w-0 grid-cols-[minmax(0,1fr)_76px] items-center gap-3 text-left transition-colors hover:bg-card focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
                    href={`/trade/${row.code}`}
                  >
                    <div className='flex min-w-0 items-center gap-2.5'>
                      <CoinIcon marketCode={row.code} size={26} />
                      <span className='flex min-w-0 flex-1 items-center gap-1'>
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-sm font-semibold",
                            active ? "text-primary" : "text-foreground",
                          )}
                        >
                          {row.koreanName}
                        </span>
                        <span className='shrink-0 text-[10px] text-muted-foreground'>{row.code.replace("KRW-", "")}</span>
                      </span>
                    </div>
                    <span className='flex min-w-0 flex-col items-end gap-0.5'>
                      <span
                        className={cn(
                          "truncate text-xs font-medium tabular-nums",
                          row.isActive ? tone : "text-muted-foreground",
                        )}
                      >
                        {row.tradePrice}
                      </span>
                      <span
                        className={cn("truncate text-xs tabular-nums", row.isActive ? tone : "text-muted-foreground")}
                      >
                        {row.changeRate}
                      </span>
                    </span>
                  </Link>
                </div>
              );
            })}
            {visibleCount < sortedRows.length ? <div ref={observerRef} className='h-4 w-full bg-transparent' /> : null}
          </>
        )}
      </div>
    </aside>
  );
};
