"use client";

import { useEffect, useMemo, useState } from "react";

import { Header } from "@/widgets";
import { Heart, List, PanelLeftClose } from "lucide-react";

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
  const [isMarketListOpen, setIsMarketListOpen] = useState(true);
  const [isLg, setIsLg] = useState(false);
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
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e: MediaQueryListEvent) => setIsLg(e.matches);

    setIsLg(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

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
        <div className='grid lg:h-[calc(100vh-80px)] lg:grid-cols-[48px_auto_minmax(0,1fr)]'>
          <nav aria-label='마켓 목록' className='hidden flex-col border-r border-border bg-background lg:flex'>
            <button
              aria-expanded={isMarketListOpen}
              aria-label={isMarketListOpen ? "코인 목록 접기" : "코인 목록 펼치기"}
              className='flex h-12 flex-col items-center justify-center gap-1 border-b border-border text-subtle-foreground transition-colors active:scale-95 hover:bg-card hover:text-foreground'
              onClick={() => setIsMarketListOpen((isOpen) => !isOpen)}
              type='button'
            >
              <PanelLeftClose
                aria-hidden='true'
                className={`transition-transform duration-300 ease-out motion-reduce:transition-none ${
                  isMarketListOpen ? "" : "rotate-180"
                }`}
                size={18}
              />
            </button>
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
          <div
            aria-hidden={!isMarketListOpen && isLg}
            className={`overflow-hidden lg:h-full lg:transition-[width] lg:duration-300 lg:ease-out motion-reduce:transition-none ${
              isMarketListOpen ? "lg:w-[440px]" : "lg:pointer-events-none lg:w-0"
            }`}
            inert={!isMarketListOpen && isLg}
          >
            <div className='lg:h-full lg:w-[440px] lg:shrink-0'>
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
            </div>
          </div>
          <div className='flex min-w-0 flex-col bg-background px-4 lg:min-h-0 lg:overflow-y-auto lg:px-10'>
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
