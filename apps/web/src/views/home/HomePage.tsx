"use client";

import { useEffect, useMemo, useState } from "react";

import { Header } from "@/widgets";

import { MarketChartPanel, MarketListPanel, MarketOrderPanel, useMarketTickers, useMarkets, useTicker } from "@/features/market";

export default function HomePage() {
  const [selectedMarketCode, setSelectedMarketCode] = useState("KRW-BTC");
  const [searchKeyword, setSearchKeyword] = useState("");
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true });
  const markets = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const selectedMarket = markets.find((market) => market.code === selectedMarketCode);
  const tickerQuery = useTicker(selectedMarketCode);

  // 목록·차트가 같은 실시간 티커를 공유한다. 코인을 바꿔도 이미 수신한 가격을
  // 즉시 헤더에 표시할 수 있어 로딩 지연이 없다.
  const marketCodes = useMemo(() => markets.map((market) => market.code), [markets]);
  const tickers = useMarketTickers(marketCodes);
  const selectedTicker = tickers[selectedMarketCode] ?? tickerQuery.data;

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
      <main className='bg-background text-foreground min-h-[calc(100vh-80px)]'>
        <div className='mx-auto grid max-w-7xl px-10 lg:min-h-[calc(100vh-80px)] lg:grid-cols-[minmax(280px,28%)_minmax(0,72%)]'>
          <MarketListPanel
            isLoading={marketsQuery.isLoading}
            markets={markets}
            onSearchKeywordChange={setSearchKeyword}
            onSelectMarket={setSelectedMarketCode}
            searchKeyword={searchKeyword}
            selectedMarketCode={selectedMarketCode}
            tickers={tickers}
          />
          <div className='bg-background flex min-w-0 flex-col'>
            <MarketChartPanel
              isLoading={tickerQuery.isLoading}
              market={selectedMarket}
              selectedMarketCode={selectedMarketCode}
              ticker={selectedTicker}
            />
            <MarketOrderPanel marketCode={selectedMarketCode} />
          </div>
        </div>
      </main>
    </>
  );
}
