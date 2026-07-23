"use client";

import { useRouter } from "next/navigation";

import { useEffect, useMemo } from "react";

import { AppLayout } from "@/widgets";

import {
  MarketChartPanel,
  MarketOrderPanel,
  useMarketTickers,
  useMarkets,
  useTicker,
} from "@/features/market";

type TradePageProps = {
  marketCode: string;
};

export default function TradePage({ marketCode }: TradePageProps) {
  const router = useRouter();
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

  return (
    <AppLayout noMainPadding>
      <div className='min-h-[calc(100vh-52px)] bg-background text-foreground'>
        <div className='flex min-w-0 flex-col bg-background px-4 lg:min-h-[calc(100vh-52px)] lg:px-10'>
          <MarketChartPanel
            isLoading={tickerQuery.isLoading}
            market={selectedMarket}
            selectedMarketCode={marketCode}
            ticker={selectedTicker}
          />
          <MarketOrderPanel marketCode={marketCode} />
        </div>
      </div>
    </AppLayout>
  );
}
