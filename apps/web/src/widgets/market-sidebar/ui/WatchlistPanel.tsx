"use client";

import Link from "next/link";

import { useState } from "react";

import { Button, ROUTES_PATH, cn } from "@/shared";
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { ChevronDown, Heart, Sparkles } from "lucide-react";

import { useWatchlistPanel } from "../model";

import { SidebarCoinRow } from "./SidebarCoinRow";

type WatchlistPanelProps = {
  markets: Market[];
  tickers: Record<string, MarketTickerUpdatedEvent>;
  isLoading: boolean;
  selectedMarketCode: string;
};

export const WatchlistPanel = ({ markets, tickers, selectedMarketCode }: WatchlistPanelProps) => {
  const [groupOpen, setGroupOpen] = useState(true);
  const { hasNoFavorites, headline, headlineIndex, isAuthenticated, rows } = useWatchlistPanel(markets, tickers);

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <header className='px-4 py-3'>
        <h2 className='text-sm font-semibold text-foreground'>관심</h2>
      </header>
      <div className='flex-1 overflow-y-auto'>
        <Link
          className='flex items-center gap-2 border-y border-border bg-surface-sunken px-4 py-3 transition-colors hover:bg-card'
          href={ROUTES_PATH.NEWS}
        >
          <Sparkles aria-hidden='true' className='shrink-0 text-primary' size={16} />
          <span className='min-w-0'>
            <span className='block text-[11px] font-semibold text-primary'>Dobbit AI</span>
            <span
              className='line-clamp-1 animate-in text-xs text-muted-foreground duration-500 fade-in'
              key={headlineIndex}
            >
              {headline ?? "코인 뉴스 요약을 확인해보세요."}
            </span>
          </span>
        </Link>

        {!isAuthenticated ? (
          <div className='flex flex-col items-center gap-3 px-4 py-10 text-center'>
            <Heart aria-hidden='true' className='text-subtle-foreground' size={24} />
            <p className='text-sm text-muted-foreground'>로그인하고 관심 코인을 모아보세요.</p>
            <Button asChild size='sm'>
              <Link href={ROUTES_PATH.LOGIN}>로그인</Link>
            </Button>
          </div>
        ) : (
          <>
            <button
              aria-expanded={groupOpen}
              className='flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
              onClick={() => setGroupOpen((previous) => !previous)}
              type='button'
            >
              기본
              <ChevronDown
                aria-hidden='true'
                className={cn("transition-transform duration-200", groupOpen ? "" : "-rotate-90")}
                size={14}
              />
            </button>
            {groupOpen ? (
              hasNoFavorites ? (
                <>
                  <p className='px-4 pb-2 text-xs text-muted-foreground'>거래대금이 높은 코인을 살펴보세요.</p>
                  {rows.map((row) => (
                    <SidebarCoinRow active={row.code === selectedMarketCode} key={row.code} row={row} />
                  ))}
                </>
              ) : rows.length === 0 ? (
                <p className='px-4 py-8 text-sm text-muted-foreground'>관심 코인이 없어요.</p>
              ) : (
                rows.map((row) => <SidebarCoinRow active={row.code === selectedMarketCode} key={row.code} row={row} />)
              )
            ) : null}
          </>
        )}
      </div>
    </section>
  );
};
