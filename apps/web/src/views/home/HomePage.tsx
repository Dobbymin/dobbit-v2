"use client";

import { useEffect, useMemo, useState } from "react";

import { Header } from "@/widgets";

import { MarketChartPanel, MarketListPanel, MarketOrderPanel, useMarkets, useTicker } from "@/features/market";

export default function HomePage() {
  const [selectedMarketCode, setSelectedMarketCode] = useState("KRW-BTC");
  const [searchKeyword, setSearchKeyword] = useState("");
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true });
  const markets = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const selectedMarket = markets.find((market) => market.code === selectedMarketCode);
  const tickerQuery = useTicker(selectedMarketCode);

  useEffect(() => {
    const firstKrwMarket =
      markets.find((market) => market.code === "KRW-BTC") ?? markets.find((market) => market.code.startsWith("KRW-"));

    if (!selectedMarket && firstKrwMarket) {
      setSelectedMarketCode(firstKrwMarket.code);
    }
  }, [markets, selectedMarket]);

  return (
    <>
      <Header />
      <main className='min-h-[calc(100vh-80px)] bg-background text-text-dark'>
        <div className='mx-auto grid max-w-7xl px-10 lg:min-h-[calc(100vh-80px)] lg:grid-cols-[minmax(280px,28%)_minmax(0,72%)]'>
          <MarketListPanel
            isLoading={marketsQuery.isLoading}
            markets={markets}
            onSearchKeywordChange={setSearchKeyword}
            onSelectMarket={setSelectedMarketCode}
            searchKeyword={searchKeyword}
            selectedMarketCode={selectedMarketCode}
          />
          <div className='flex min-w-0 flex-col bg-[#121212]'>
            <MarketChartPanel
              isLoading={tickerQuery.isLoading}
              market={selectedMarket}
              selectedMarketCode={selectedMarketCode}
              ticker={tickerQuery.data}
            />
            <MarketOrderPanel marketCode={selectedMarketCode} />
          </div>
        </div>
      </main>
    </>
  );
}
