"use client";

import { useEffect, useMemo, useState } from "react";

import { Header } from "@/widgets";
import { Heart, List } from "lucide-react";

import {
  MarketChartPanel,
  MarketListPanel,
  MarketOrderPanel,
  useMarketTickers,
  useMarkets,
  useTicker,
} from "@/features/market";

type MarketListTab = "all" | "favorite";

export default function HomePage() {
  const [selectedMarketCode, setSelectedMarketCode] = useState("KRW-BTC");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeMarketListTab, setActiveMarketListTab] = useState<MarketListTab>("all");
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
      <main className='min-h-[calc(100vh-80px)] bg-background text-foreground'>
        <div className='mx-auto grid max-w-7xl px-10 lg:h-[calc(100vh-80px)] lg:grid-cols-[48px_minmax(280px,32%)_minmax(0,1fr)]'>
          <nav aria-label='마켓 목록' className='hidden flex-col border-r border-border bg-background lg:flex'>
            {(
              [
                ["all", "전체", List],
                ["favorite", "관심", Heart],
              ] as const
            ).map(([tab, label, Icon]) => {
              const active = activeMarketListTab === tab;

              return (
                <button
                  aria-pressed={active}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                    active
                      ? "bg-surface-sunken text-foreground"
                      : "text-subtle-foreground hover:bg-card hover:text-foreground"
                  }`}
                  key={tab}
                  onClick={() => setActiveMarketListTab(tab)}
                  type='button'
                >
                  <Icon aria-hidden='true' className={active && Icon === Heart ? "fill-current" : undefined} size={18} />
                  {label}
                </button>
              );
            })}
          </nav>
          <MarketListPanel
            activeTab={activeMarketListTab}
            isLoading={marketsQuery.isLoading}
            markets={markets}
            onActiveTabChange={setActiveMarketListTab}
            onSearchKeywordChange={setSearchKeyword}
            onSelectMarket={setSelectedMarketCode}
            searchKeyword={searchKeyword}
            selectedMarketCode={selectedMarketCode}
            tickers={tickers}
          />
          <div className='flex min-w-0 flex-col bg-background lg:min-h-0 lg:overflow-y-auto'>
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
