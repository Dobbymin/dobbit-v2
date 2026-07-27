"use client";

import { usePathname } from "next/navigation";

import { useCallback, useMemo, useState } from "react";

import { useSidebarStore } from "@/shared";

import { useMarketTickers, useMarkets } from "@/features/market";

import { getSidebarSearchRows } from "./sidebar-market-rows";

export type SidebarTab = "invest" | "watchlist" | "recent" | "realtime";

export const useMarketSidebar = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<SidebarTab>("realtime");
  const [searchKeyword, setSearchKeyword] = useState("");
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setSidebarOpen = useSidebarStore((state) => state.setOpen);
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true });
  const markets = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const marketCodes = useMemo(() => markets.map((market) => market.code), [markets]);
  const tickers = useMarketTickers(marketCodes);
  const selectedMarketCode = pathname.match(/^\/trade\/([^/]+)$/)?.[1] ?? "";
  const searchResults = useMemo(
    () => getSidebarSearchRows(markets, tickers, searchKeyword),
    [markets, searchKeyword, tickers],
  );
  const selectTab = useCallback(
    (tab: SidebarTab) => {
      if (activeTab === tab && isOpen) {
        setSidebarOpen(false);
        return;
      }

      setActiveTab(tab);
      setSidebarOpen(true);
    },
    [activeTab, isOpen, setSidebarOpen],
  );

  return {
    activeTab,
    isLoading: marketsQuery.isLoading,
    isOpen,
    isSearching: searchKeyword.trim().length > 0,
    markets,
    searchKeyword,
    searchResults,
    selectedMarketCode,
    selectTab,
    setSearchKeyword,
    tickers,
    toggleSidebar,
  };
};
