"use client";

import { usePathname } from "next/navigation";

import { useMemo, useState } from "react";

import { Input, useSidebarStore } from "@/shared";
import { toMarketRow, useMarketTickers, useMarkets } from "@/features/market";
import { Briefcase, Clock, Flame, Heart, PanelLeftClose, Search } from "lucide-react";

import { MyInvestmentPanel } from "./MyInvestmentPanel";
import { RealtimeRankingPanel } from "./RealtimeRankingPanel";
import { RecentlyViewedPanel } from "./RecentlyViewedPanel";
import { SidebarCoinRow } from "./SidebarCoinRow";
import { WatchlistPanel } from "./WatchlistPanel";

type SidebarTab = "invest" | "watchlist" | "recent" | "realtime";

const TABS = [
  ["invest", "내 투자", Briefcase],
  ["watchlist", "관심", Heart],
  ["recent", "최근 본", Clock],
  ["realtime", "실시간", Flame],
] as const;

export const MarketSidebar = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<SidebarTab>("realtime");
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setSidebarOpen = useSidebarStore((state) => state.setOpen);
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const [searchKeyword, setSearchKeyword] = useState("");
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true });
  const markets = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const marketCodes = useMemo(() => markets.map((market) => market.code), [markets]);
  const tickers = useMarketTickers(marketCodes);
  const selectedMarketCode = pathname.match(/^\/trade\/([^/]+)$/)?.[1] ?? "";

  const searchResults = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return [];
    return markets
      .filter(
        (market) =>
          market.code.toLowerCase().includes(keyword) ||
          market.koreanName.toLowerCase().includes(keyword) ||
          market.symbol.toLowerCase().includes(keyword),
      )
      .slice(0, 50)
      .map((market) => toMarketRow(market, tickers[market.code]));
  }, [markets, searchKeyword, tickers]);

  const isSearching = searchKeyword.trim().length > 0;

  return (
    <aside
      className={`sticky top-[52px] mt-[52px] hidden h-[calc(100vh-52px)] min-w-0 shrink-0 flex-row self-start bg-background transition-[width] duration-300 ease-out motion-reduce:transition-none lg:flex ${
        isOpen ? "w-[368px]" : "w-12"
      }`}
    >
      <div
        aria-hidden={!isOpen}
        className={`h-full min-w-0 overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "w-[320px]" : "hidden"
        }`}
        inert={!isOpen}
      >
        <div className='flex h-full w-[320px] shrink-0 flex-col border-r border-border'>
          <div className='border-b border-border p-3'>
            <div className='relative'>
              <Input
                aria-label='코인 검색'
                className='h-10 rounded-lg border-none bg-card pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40'
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder='코인명 / 심볼 검색'
                value={searchKeyword}
              />
              <Search className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground' size={16} />
            </div>
          </div>
          <div className='flex min-h-0 flex-1 flex-col'>
            {isSearching ? (
              <div className='flex-1 overflow-y-auto'>
                {searchResults.length === 0 ? (
                  <p className='px-4 py-8 text-sm text-muted-foreground'>검색 결과가 없습니다.</p>
                ) : (
                  searchResults.map((row) => (
                    <SidebarCoinRow active={row.code === selectedMarketCode} key={row.code} row={row} />
                  ))
                )}
              </div>
            ) : activeTab === "invest" ? (
              <MyInvestmentPanel selectedMarketCode={selectedMarketCode} />
            ) : activeTab === "watchlist" ? (
              <WatchlistPanel
                isLoading={marketsQuery.isLoading}
                markets={markets}
                selectedMarketCode={selectedMarketCode}
                tickers={tickers}
              />
            ) : activeTab === "recent" ? (
              <RecentlyViewedPanel markets={markets} selectedMarketCode={selectedMarketCode} tickers={tickers} />
            ) : (
              <RealtimeRankingPanel
                isLoading={marketsQuery.isLoading}
                markets={markets}
                selectedMarketCode={selectedMarketCode}
                tickers={tickers}
              />
            )}
          </div>
        </div>
      </div>
      <nav aria-label='사이드바 메뉴' className='flex w-12 shrink-0 flex-col border-l border-border bg-background'>
        <button
          aria-expanded={isOpen}
          aria-label='사이드바 접기/펼치기'
          className='flex h-12 flex-col items-center justify-center gap-1 border-b border-border text-subtle-foreground transition-colors hover:bg-card hover:text-foreground active:scale-95'
          onClick={toggleSidebar}
          type='button'
        >
          <PanelLeftClose
            aria-hidden='true'
            className={`transition-transform duration-300 ease-out motion-reduce:transition-none ${isOpen ? "" : "rotate-180"}`}
            size={18}
          />
        </button>
        {TABS.map(([tab, label, Icon]) => {
          const active = activeTab === tab;

          return (
            <button
              aria-label={label}
              aria-pressed={active && isOpen}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                active && isOpen
                  ? "bg-surface-sunken text-foreground"
                  : "text-subtle-foreground hover:bg-card hover:text-foreground"
              }`}
              key={tab}
              onClick={() => {
                if (active && isOpen) {
                  setSidebarOpen(false);
                  return;
                }
                setActiveTab(tab);
                setSidebarOpen(true);
              }}
              type='button'
            >
              <Icon aria-hidden='true' className={active && isOpen && Icon === Heart ? "fill-current" : undefined} size={18} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
