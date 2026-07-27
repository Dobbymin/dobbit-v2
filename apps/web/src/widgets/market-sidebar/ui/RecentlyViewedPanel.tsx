"use client";

import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { Clock } from "lucide-react";

import { useRecentlyViewedPanel } from "../model";

import { SidebarCoinRow } from "./SidebarCoinRow";

type RecentlyViewedPanelProps = {
  markets: Market[];
  tickers: Record<string, MarketTickerUpdatedEvent>;
  selectedMarketCode: string;
};

export const RecentlyViewedPanel = ({ markets, tickers, selectedMarketCode }: RecentlyViewedPanelProps) => {
  const { hasRecentlyViewed, rows } = useRecentlyViewedPanel(markets, tickers);

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <header className='px-4 py-3'>
        <h2 className='text-sm font-semibold text-foreground'>최근 본</h2>
      </header>
      <div className='flex-1 overflow-y-auto'>
        {!hasRecentlyViewed ? (
          <div className='flex flex-col items-center gap-3 px-4 py-10 text-center'>
            <Clock aria-hidden='true' className='text-subtle-foreground' size={24} />
            <p className='text-sm text-muted-foreground'>최근 본 종목이 없어요.</p>
          </div>
        ) : (
          rows.map((row) => <SidebarCoinRow active={row.code === selectedMarketCode} key={row.code} row={row} />)
        )}
      </div>
    </section>
  );
};
