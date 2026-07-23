"use client";

import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/widgets";
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

type TradePageProps = {
  marketCode: string;
};

export default function TradePage({ marketCode }: TradePageProps) {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeMarketListTab, setActiveMarketListTab] = useState<MarketListTab>("all");
  const [isMarketListOpen, setIsMarketListOpen] = useState(true);
  const [isLg, setIsLg] = useState(false);
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true });
  const markets = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const selectedMarket = markets.find((market) => market.code === marketCode);
  const tickerQuery = useTicker(marketCode);

  const marketCodes = useMemo(() => markets.map((market) => market.code), [markets]);
  const tickers = useMarketTickers(marketCodes);
  const selectedTicker = tickers[marketCode] ?? tickerQuery.data;

  useEffect(() => {
    if (!marketsQuery.isLoading && markets.length > 0 && !markets.find((m) => m.code === marketCode)) {
      router.replace("/trade/KRW-BTC");
    }
  }, [marketCode, marketsQuery.isLoading, markets, router]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e: MediaQueryListEvent) => setIsLg(e.matches);

    setIsLg(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <AppLayout noMainPadding>
      <div className='min-h-[calc(100vh-52px)] bg-background text-foreground'>
        <div className='grid lg:h-[calc(100vh-52px)] lg:grid-cols-[48px_auto_minmax(0,1fr)]'>
          <nav aria-label='마켓 목록' className='hidden flex-col border-r border-border bg-background lg:flex'>
            <button
              aria-expanded={isMarketListOpen}
              aria-label={isMarketListOpen ? "코인 목록 접기" : "코인 목록 펼치기"}
              className='flex h-12 flex-col items-center justify-center gap-1 border-b border-border text-subtle-foreground transition-colors hover:bg-card hover:text-foreground active:scale-95'
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
                  <Icon
                    aria-hidden='true'
                    className={active && Icon === Heart ? "fill-current" : undefined}
                    size={18}
                  />
                  {label}
                </button>
              );
            })}
          </nav>
          <div
            aria-hidden={!isMarketListOpen && isLg ? true : undefined}
            className={`overflow-hidden motion-reduce:transition-none lg:h-full lg:transition-[width] lg:duration-300 lg:ease-out ${
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
                searchKeyword={searchKeyword}
                selectedMarketCode={marketCode}
                tickers={tickers}
              />
            </div>
          </div>
          <div className='flex min-w-0 flex-col bg-background px-4 lg:min-h-0 lg:overflow-y-auto lg:px-10'>
            <MarketChartPanel
              isLoading={tickerQuery.isLoading}
              market={selectedMarket}
              selectedMarketCode={marketCode}
              ticker={selectedTicker}
            />
            <MarketOrderPanel marketCode={marketCode} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
