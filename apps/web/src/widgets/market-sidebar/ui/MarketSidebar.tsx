"use client";

import { Input } from "@/shared";
import { ChevronsLeft, ChevronsRight, Flame, Heart, History, Search, Wallet } from "lucide-react";

import { useMarketSidebar } from "../model";

import { MyInvestmentPanel } from "./MyInvestmentPanel";
import { RealtimeRankingPanel } from "./RealtimeRankingPanel";
import { RecentlyViewedPanel } from "./RecentlyViewedPanel";
import { SidebarCoinRow } from "./SidebarCoinRow";
import { WatchlistPanel } from "./WatchlistPanel";

const TABS = [
  ["invest", "내 투자", Wallet],
  ["watchlist", "관심", Heart],
  ["recent", "최근 본", History],
  ["realtime", "실시간", Flame],
] as const;

export const MarketSidebar = () => {
  const {
    activeTab,
    isLoading,
    isOpen,
    isSearching,
    markets,
    searchKeyword,
    searchResults,
    selectedMarketCode,
    selectTab,
    setSearchKeyword,
    tickers,
    toggleSidebar,
  } = useMarketSidebar();

  return (
    <aside
      className={`sticky top-[52px] mt-[52px] hidden h-[calc(100vh-52px)] min-w-0 shrink-0 flex-row self-start border-l border-border/70 bg-background transition-[width] duration-300 ease-out motion-reduce:transition-none lg:flex ${
        isOpen ? "w-[400px]" : "w-16"
      }`}
    >
      <div
        aria-hidden={!isOpen}
        className={`h-full min-w-0 overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "w-[336px]" : "w-0"
        }`}
        inert={!isOpen}
      >
        <div className='flex h-full w-[336px] shrink-0 flex-col border-r border-border/70'>
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
                isLoading={isLoading}
                markets={markets}
                selectedMarketCode={selectedMarketCode}
                tickers={tickers}
              />
            ) : activeTab === "recent" ? (
              <RecentlyViewedPanel markets={markets} selectedMarketCode={selectedMarketCode} tickers={tickers} />
            ) : (
              <RealtimeRankingPanel
                isLoading={isLoading}
                markets={markets}
                selectedMarketCode={selectedMarketCode}
                tickers={tickers}
              />
            )}
          </div>
        </div>
      </div>
      <nav aria-label='사이드바 메뉴' className='flex w-16 shrink-0 flex-col bg-background'>
        <button
          aria-expanded={isOpen}
          aria-label='사이드바 접기/펼치기'
          className='flex h-14 flex-col items-center justify-center gap-1 border-b border-border/70 text-subtle-foreground transition-colors hover:bg-card hover:text-foreground active:scale-95'
          onClick={toggleSidebar}
          type='button'
        >
          {isOpen ? <ChevronsLeft aria-hidden='true' size={20} /> : <ChevronsRight aria-hidden='true' size={20} />}
        </button>
        {TABS.map(([tab, label, Icon]) => {
          const active = activeTab === tab;

          return (
            <button
              aria-label={label}
              aria-pressed={active && isOpen}
              className={`relative flex h-[72px] flex-col items-center justify-center gap-1.5 text-[11px] font-medium transition-colors ${
                active
                  ? isOpen
                    ? "bg-primary/8 text-primary before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-r-full before:bg-primary"
                    : "text-primary"
                  : "text-subtle-foreground hover:bg-card hover:text-foreground"
              }`}
              key={tab}
              onClick={() => selectTab(tab)}
              type='button'
            >
              <Icon
                aria-hidden='true'
                className={Icon === Heart || (active && Icon === Wallet) ? "fill-current" : undefined}
                size={20}
              />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
