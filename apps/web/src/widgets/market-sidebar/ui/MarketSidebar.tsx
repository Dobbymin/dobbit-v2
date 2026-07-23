"use client";

import { usePathname } from "next/navigation";

import { useMemo, useState } from "react";

import { MarketListPanel, useMarketTickers, useMarkets } from "@/features/market";
import { Heart, List, PanelLeftClose } from "lucide-react";

type MarketListTab = "all" | "favorite";

export const MarketSidebar = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<MarketListTab>("all");
  const [isOpen, setIsOpen] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true });
  const markets = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const marketCodes = useMemo(() => markets.map((market) => market.code), [markets]);
  const tickers = useMarketTickers(marketCodes);
  const selectedMarketCode = pathname.match(/^\/trade\/([^/]+)$/)?.[1] ?? "";

  return (
    <aside
      className={`mt-[52px] hidden h-[calc(100vh-52px)] min-w-0 shrink-0 flex-row bg-background transition-[width] duration-300 ease-out motion-reduce:transition-none lg:flex ${
        isOpen ? "w-[360px]" : "w-12"
      }`}
    >
      <div
        aria-hidden={!isOpen}
        className={`h-full min-w-0 overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "w-[312px]" : "hidden"
        }`}
        inert={!isOpen}
      >
        <div className='h-full w-[312px] shrink-0'>
          <MarketListPanel
            activeTab={activeTab}
            isLoading={marketsQuery.isLoading}
            markets={markets}
            onActiveTabChange={setActiveTab}
            onSearchKeywordChange={setSearchKeyword}
            searchKeyword={searchKeyword}
            selectedMarketCode={selectedMarketCode}
            showTabs={false}
            tickers={tickers}
          />
        </div>
      </div>
      <nav aria-label='마켓 목록' className='flex w-12 shrink-0 flex-col border-l border-border bg-background'>
        <button
          aria-expanded={isOpen}
          aria-label='코인 목록 접기/펼치기'
          className='flex h-12 flex-col items-center justify-center gap-1 border-b border-border text-subtle-foreground transition-colors hover:bg-card hover:text-foreground active:scale-95'
          onClick={() => setIsOpen((previous) => !previous)}
          type='button'
        >
          <PanelLeftClose
            aria-hidden='true'
            className={`transition-transform duration-300 ease-out motion-reduce:transition-none ${isOpen ? "" : "rotate-180"}`}
            size={18}
          />
        </button>
        {(
          [
            ["all", "전체", List],
            ["favorite", "관심", Heart],
          ] as const
        ).map(([tab, label, Icon]) => {
          const active = activeTab === tab;

          return (
            <button
              aria-label={label}
              aria-pressed={active}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                active
                  ? "bg-surface-sunken text-foreground"
                  : "text-subtle-foreground hover:bg-card hover:text-foreground"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type='button'
            >
              <Icon aria-hidden='true' className={active && Icon === Heart ? "fill-current" : undefined} size={18} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
