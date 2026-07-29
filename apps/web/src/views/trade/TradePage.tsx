"use client";

import { useMemo } from "react";

import {
  MarketChartPanel,
  MarketOrderPanel,
  useMarketTickers,
  useMarkets,
  useTicker,
  useTradePageMarket,
} from "@/features/market";

type TradePageProps = {
  marketCode: string;
};

export default function TradePage({ marketCode }: TradePageProps) {
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true });
  const markets = useMemo(() => marketsQuery.data ?? [], [marketsQuery.data]);
  const { selectedMarket } = useTradePageMarket({
    marketCode,
    markets,
    isMarketsLoading: marketsQuery.isLoading,
  });
  const tickerQuery = useTicker(marketCode);

  const marketCodes = useMemo(() => markets.map((market) => market.code), [markets]);
  const tickers = useMarketTickers(marketCodes);
  const selectedTicker = tickers[marketCode] ?? tickerQuery.data;

  return (
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
  );
}
