"use client";

import { useRouter } from "next/navigation";

import { useEffect, useMemo } from "react";

import type { Market } from "@dobbit/shared";

import { useRecentlyViewed } from "./useRecentlyViewed";

type UseTradePageMarketParams = {
  marketCode: string;
  markets: Market[];
  isMarketsLoading: boolean;
};

export const useTradePageMarket = ({ marketCode, markets, isMarketsLoading }: UseTradePageMarketParams) => {
  const router = useRouter();
  const { record } = useRecentlyViewed();
  const selectedMarket = useMemo(() => markets.find((market) => market.code === marketCode), [marketCode, markets]);

  useEffect(() => {
    if (!isMarketsLoading && markets.length > 0 && !markets.find((market) => market.code === marketCode)) {
      router.replace("/trade/KRW-BTC");
    }
  }, [isMarketsLoading, marketCode, markets, router]);

  useEffect(() => {
    if (selectedMarket) record(marketCode);
  }, [marketCode, record, selectedMarket]);

  return { selectedMarket };
};
