"use client";

import { useCallback, useEffect, useState } from "react";

import { Input, Skeleton, cn } from "@/shared";
import { useIntersectionObserver } from "@/shared";
import type { Market } from "@dobbit/shared";
import { Search } from "lucide-react";

import { toMarketRow, useMarketTickers } from "../model";

type MarketListPanelProps = {
  markets: Market[];
  selectedMarketCode: string;
  searchKeyword: string;
  isLoading: boolean;
  onSearchKeywordChange: (value: string) => void;
  onSelectMarket: (marketCode: string) => void;
};

type MarketDisplayRow = {
  code: string;
  koreanName: string;
  symbolPair: string;
  tradePrice: string;
  changeRate: string;
  changeTone: "increase" | "decrease";
  isActive: boolean;
};

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
  onSearchKeywordChange,
  onSelectMarket,
}: MarketListPanelProps) => {
  // 로컬 입력 state
  const [localSearchKeyword, setLocalSearchKeyword] = useState(searchKeyword);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

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

  // Subscribe to real-time tickers for all markets
  const tickers = useMarketTickers(markets.length > 0 ? markets.map((m) => m.code) : []);

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

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [localSearchKeyword]);

  const observerRef = useIntersectionObserver(
    useCallback(() => {
      if (visibleCount < filteredRows.length) {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, [filteredRows.length, visibleCount]),
  );

  const visibleRows = filteredRows.slice(0, visibleCount);

  return (
    <aside className='flex min-h-[520px] flex-col border-r border-white/10 bg-surface-dark/20 lg:min-h-[calc(100vh-80px)]'>
      <div className='border-b border-white/10 p-4'>
        <div className='relative'>
          <Input
            aria-label='마켓 검색'
            className='h-10 rounded-lg border-none bg-surface-dark pl-9 text-sm text-text-dark placeholder:text-text-muted-dark focus-visible:ring-primary/50'
            onChange={(event) => setLocalSearchKeyword(event.target.value)}
            placeholder='코인명 / 심볼 검색'
            value={localSearchKeyword}
          />
          <Search className='absolute top-1/2 left-3 -translate-y-1/2 text-text-muted-dark' size={16} />
        </div>
        {isLoading ? (
          <span aria-live='polite' className='sr-only'>
            마켓 동기화 중
          </span>
        ) : null}
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_88px_72px] gap-3 border-b border-white/10 bg-surface-dark/30 px-4 py-3 text-xs font-semibold text-text-muted-dark backdrop-blur-sm'>
          <span>마켓</span>
          <span className='text-right'>현재가</span>
          <span className='text-right'>변동률</span>
        </div>
        {isLoading && filteredRows.length === 0 ? (
          <div className='space-y-1'>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className='grid grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-3 border-b border-white/5 px-4 py-3'>
                <div className='space-y-1'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-3 w-16' />
                </div>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-12' />
              </div>
            ))}
          </div>
        ) : filteredRows.length === 0 ? (
          <p className='px-4 py-8 text-sm text-text-muted-dark'>검색 결과가 없습니다.</p>
        ) : (
          <>
            {visibleRows.map((row) => {
              const active = row.code === selectedMarketCode;
              const activeTone = row.changeTone === "increase" ? "text-increase" : "text-decrease";

              return (
                <button
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-3 border-b border-l-2 border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
                    active ? "border-l-primary bg-white/5" : "border-l-transparent",
                  )}
                  key={row.code}
                  onClick={() => onSelectMarket(row.code)}
                  type='button'
                >
                  <span className='min-w-0'>
                    <span
                      className={cn("block truncate text-xs font-semibold", active ? "text-primary" : "text-white")}
                    >
                      {row.koreanName}
                    </span>
                    <span className='mt-1 block truncate text-[10px] font-light text-text-muted-dark'>
                      {row.symbolPair}
                    </span>
                  </span>
                  <span
                    className={cn("text-right text-xs font-medium", row.isActive ? activeTone : "text-text-muted-dark")}
                  >
                    {row.tradePrice}
                  </span>
                  <span className={cn("text-right text-xs", row.isActive ? activeTone : "text-text-muted-dark")}>
                    {row.changeRate}
                  </span>
                </button>
              );
            })}
            {visibleCount < filteredRows.length ? (
              <div ref={observerRef} className='h-4 w-full bg-transparent' />
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
};
