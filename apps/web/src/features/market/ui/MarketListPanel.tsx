"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Input, Skeleton, cn } from "@/shared";
import { useIntersectionObserver } from "@/shared";
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";

import { toMarketRow } from "../model";

type MarketListPanelProps = {
  markets: Market[];
  selectedMarketCode: string;
  searchKeyword: string;
  isLoading: boolean;
  /** 상위(HomePage)에서 구독한 실시간 티커. 차트 패널과 공유한다. */
  tickers: Record<string, MarketTickerUpdatedEvent>;
  onSearchKeywordChange: (value: string) => void;
  onSelectMarket: (marketCode: string) => void;
};

type MarketDisplayRow = {
  code: string;
  koreanName: string;
  symbolPair: string;
  tradePrice: string;
  changeRate: string;
  changeTone: "increase" | "decrease" | "neutral";
  isActive: boolean;
};

type SortKey = "market" | "price" | "changeRate";
type SortDirection = "asc" | "desc";

const fallbackRows: MarketDisplayRow[] = [
  {
    code: "KRW-BTC",
    koreanName: "비트코인",
    symbolPair: "BTC/KRW",
    tradePrice: "98,501,000",
    changeRate: "-0.69%",
    changeTone: "decrease",
    isActive: true,
  },
  {
    code: "KRW-WAXP",
    koreanName: "왁스",
    symbolPair: "WAXP/KRW",
    tradePrice: "24.42",
    changeRate: "+5.41%",
    changeTone: "increase",
    isActive: true,
  },
  {
    code: "KRW-XRP",
    koreanName: "리플",
    symbolPair: "XRP/KRW",
    tradePrice: "2,927",
    changeRate: "-1.24%",
    changeTone: "decrease",
    isActive: true,
  },
  {
    code: "KRW-ETH",
    koreanName: "이더리움",
    symbolPair: "ETH/KRW",
    tradePrice: "4,783,000",
    changeRate: "+1.18%",
    changeTone: "increase",
    isActive: true,
  },
  {
    code: "KRW-SOL",
    koreanName: "솔라나",
    symbolPair: "SOL/KRW",
    tradePrice: "211,400",
    changeRate: "-2.36%",
    changeTone: "decrease",
    isActive: true,
  },
];

const ITEMS_PER_PAGE = 20;

export const MarketListPanel = ({
  markets,
  selectedMarketCode,
  searchKeyword,
  isLoading,
  tickers,
  onSearchKeywordChange,
  onSelectMarket,
}: MarketListPanelProps) => {
  // 로컬 입력 state
  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchKeywordChange(localSearchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchKeyword, onSearchKeywordChange]);

  // 외부에서 searchKeyword가 변경되면 로컬 state도 동기화
  useEffect(() => {
    setLocalSearchKeyword(searchKeyword);
  }, [searchKeyword]);

  const rows: MarketDisplayRow[] =
    markets.length > 0
      ? markets.map((market) => {
          const tickerData = tickers[market.code];
          return toMarketRow(market, tickerData);
        })
      : fallbackRows;

  const filteredRows = rows.filter((row) => {
    const keyword = localSearchKeyword.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      row.code.toLowerCase().includes(keyword) ||
      row.koreanName.toLowerCase().includes(keyword) ||
      row.symbolPair.toLowerCase().includes(keyword)
    );
  });

  const sortedRows = useMemo(() => {
    if (sortKey === null) {
      return filteredRows;
    }

    return [...filteredRows].sort((a, b) => {
      if (sortKey === "market") {
        const comparison = a.koreanName.localeCompare(b.koreanName, "ko");
        return sortDirection === "desc" ? -comparison : comparison;
      }

      const aValue =
        sortKey === "price"
          ? tickers[a.code]?.tradePrice
          : tickers[a.code]?.signedChangeRate;
      const bValue =
        sortKey === "price"
          ? tickers[b.code]?.tradePrice
          : tickers[b.code]?.signedChangeRate;
      if (typeof aValue !== "number" || !Number.isFinite(aValue)) {
        return typeof bValue === "number" && Number.isFinite(bValue) ? 1 : 0;
      }

      if (typeof bValue !== "number" || !Number.isFinite(bValue)) {
        return -1;
      }

      const comparison = aValue - bValue;

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredRows, sortDirection, sortKey, tickers]);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("desc");
      return;
    }

    if (sortDirection === "desc") {
      setSortDirection("asc");
      return;
    }

    setSortKey(null);
  };

  const getAriaLabelForSort = (key: SortKey, headerName: string) => {
    if (sortKey !== key) {
      return `${headerName} 기준 내림차순 정렬`;
    }

    if (sortDirection === "desc") {
      return `${headerName} 기준 내림차순 정렬됨. 오름차순으로 변경`;
    }

    return `${headerName} 기준 오름차순 정렬됨. 정렬 해제`;
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown aria-hidden='true' size={12} />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp aria-hidden='true' size={12} />
    ) : (
      <ArrowDown aria-hidden='true' size={12} />
    );
  };

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [localSearchKeyword, sortDirection, sortKey]);

  const observerRef = useIntersectionObserver(
    useCallback(() => {
      if (visibleCount < sortedRows.length) {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, [sortedRows.length, visibleCount]),
  );

  const visibleRows = sortedRows.slice(0, visibleCount);

  return (
    <aside className='flex min-h-[520px] flex-col border-r border-border bg-background lg:min-h-[calc(100vh-80px)]'>
      <div className='border-b border-border p-4'>
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
        <div className='sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_88px_72px] gap-3 border-b border-border bg-background/80 px-4 py-3 text-xs font-medium text-muted-foreground backdrop-blur-sm'>
          <button
            aria-label={getAriaLabelForSort("market", "마켓")}
            className='flex items-center gap-1 text-left'
            onClick={() => handleSort("market")}
            type='button'
          >
            마켓
            {renderSortIcon("market")}
          </button>
          <button
            aria-label={getAriaLabelForSort("price", "현재가")}
            className='flex items-center justify-end gap-1 text-right'
            onClick={() => handleSort("price")}
            type='button'
          >
            현재가
            {renderSortIcon("price")}
          </button>
          <button
            aria-label={getAriaLabelForSort("changeRate", "변동률")}
            className='flex items-center justify-end gap-1 text-right'
            onClick={() => handleSort("changeRate")}
            type='button'
          >
            변동률
            {renderSortIcon("changeRate")}
          </button>
        </div>
        {isLoading && sortedRows.length === 0 ? (
          <div className='space-y-1'>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className='grid grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-3 border-b border-border/60 px-4 py-3'
              >
                <div className='space-y-1'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-3 w-16' />
                </div>
                <Skeleton className='ml-auto h-4 w-20' />
                <Skeleton className='ml-auto h-4 w-12' />
              </div>
            ))}
          </div>
        ) : sortedRows.length === 0 ? (
          <p className='px-4 py-8 text-sm text-muted-foreground'>검색 결과가 없습니다.</p>
        ) : (
          <>
            {visibleRows.map((row) => {
              const active = row.code === selectedMarketCode;
              const activeTone =
                row.changeTone === "increase"
                  ? "text-increase"
                  : row.changeTone === "decrease"
                    ? "text-decrease"
                    : "text-change-neutral";

              return (
                <button
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-3 border-b border-l-2 border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    active ? "border-l-primary bg-muted/60" : "border-l-transparent",
                  )}
                  key={row.code}
                  onClick={() => onSelectMarket(row.code)}
                  type='button'
                >
                  <span className='min-w-0'>
                    <span
                      className={cn(
                        "block truncate text-xs font-semibold",
                        active ? "text-primary" : "text-foreground",
                      )}
                    >
                      {row.koreanName}
                    </span>
                    <span className='mt-0.5 block truncate text-[10px] text-muted-foreground'>{row.symbolPair}</span>
                  </span>
                  <span
                    className={cn(
                      "text-right text-xs font-medium tabular-nums",
                      row.isActive ? activeTone : "text-muted-foreground",
                    )}
                  >
                    {row.tradePrice}
                  </span>
                  <span
                    className={cn(
                      "text-right text-xs tabular-nums",
                      row.isActive ? activeTone : "text-muted-foreground",
                    )}
                  >
                    {row.changeRate}
                  </span>
                </button>
              );
            })}
            {visibleCount < sortedRows.length ? (
              <div ref={observerRef} className='h-4 w-full bg-transparent' />
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
};
