"use client";

import { useMemo } from "react";

import { toMarketRow, useRecentlyViewed } from "@/features/market";
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { Clock } from "lucide-react";

import { SidebarCoinRow } from "./SidebarCoinRow";

type RecentlyViewedPanelProps = {
  markets: Market[];
  tickers: Record<string, MarketTickerUpdatedEvent>;
  selectedMarketCode: string;
};

export const RecentlyViewedPanel = ({ markets, tickers, selectedMarketCode }: RecentlyViewedPanelProps) => {
  const { codes } = useRecentlyViewed();
  const marketByCode = useMemo(() => new Map(markets.map((market) => [market.code, market])), [markets]);
  const rows = useMemo(
    () =>
      codes.flatMap((code) => {
        const market = marketByCode.get(code);
        return market ? [toMarketRow(market, tickers[code])] : [];
      }),
    [codes, marketByCode, tickers],
  );

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <header className='px-4 py-3'>
        <h2 className='text-sm font-semibold text-foreground'>최근 본</h2>
      </header>
      <div className='flex-1 overflow-y-auto'>
        {codes.length === 0 ? (
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
