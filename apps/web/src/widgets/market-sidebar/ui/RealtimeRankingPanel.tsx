"use client";

import { Skeleton } from "@/shared";
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

import { useRealtimeRankingPanel } from "../model";

import { SidebarCoinRow } from "./SidebarCoinRow";

type RealtimeRankingPanelProps = {
  markets: Market[];
  tickers: Record<string, MarketTickerUpdatedEvent>;
  isLoading: boolean;
  selectedMarketCode: string;
};

export const RealtimeRankingPanel = ({
  markets,
  tickers,
  isLoading,
  selectedMarketCode,
}: RealtimeRankingPanelProps) => {
  const rankedRows = useRealtimeRankingPanel(markets, tickers);

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <header className='flex items-center justify-between px-4 py-3'>
        <h2 className='text-sm font-semibold text-foreground'>실시간</h2>
        <span className='text-xs text-muted-foreground'>거래대금 순</span>
      </header>
      <div className='flex-1 overflow-y-auto'>
        {isLoading && rankedRows.length === 0 ? (
          <div className='space-y-1'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div className='grid h-[56px] grid-cols-[16px_minmax(0,1fr)_76px] items-center gap-3 px-4' key={index}>
                <Skeleton className='h-3 w-3' />
                <Skeleton className='h-7 w-32' />
                <div className='flex flex-col items-end gap-0.5'>
                  <Skeleton className='h-3.5 w-16' />
                  <Skeleton className='h-3 w-10' />
                </div>
              </div>
            ))}
          </div>
        ) : rankedRows.length === 0 ? (
          <p className='px-4 py-8 text-sm text-muted-foreground'>표시할 코인이 없습니다.</p>
        ) : (
          rankedRows.map((row, index) => (
            <SidebarCoinRow active={row.code === selectedMarketCode} key={row.code} rank={index + 1} row={row} />
          ))
        )}
      </div>
    </section>
  );
};
