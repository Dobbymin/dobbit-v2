"use client";

import { usePathname } from "next/navigation";

import { useMemo, useState } from "react";

import { MarketListPanel, useMarketTickers, useMarkets } from "@/features/market";

type MarketListTab = "all" | "favorite";

export const MarketSidebar = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<MarketListTab>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true });
  const markets = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const marketCodes = useMemo(() => markets.map((market) => market.code), [markets]);
  const tickers = useMarketTickers(marketCodes);
  const selectedMarketCode = pathname.match(/^\/trade\/([^/]+)$/)?.[1] ?? "";

  return (
    <aside className='mt-[52px] hidden h-[calc(100vh-52px)] w-[360px] shrink-0 flex-col border-l border-border bg-background lg:flex'>
      <MarketListPanel
        activeTab={activeTab}
        isLoading={marketsQuery.isLoading}
        markets={markets}
        onActiveTabChange={setActiveTab}
        onSearchKeywordChange={setSearchKeyword}
        searchKeyword={searchKeyword}
        selectedMarketCode={selectedMarketCode}
        tickers={tickers}
      />
    </aside>
  );
};
