"use client";

import { useMemo } from "react";

import type { WalletHolding } from "@dobbit/shared";

import { useMarketTickers, useMarkets } from "@/features/market/model";

import { useWalletAssets } from "./useWalletAssets";

export type HeldAsset = WalletHolding & {
  koreanName: string;
  symbolPair: string;
  livePrice: number;
  liveEvaluatedAmount: number;
  liveProfitAmount: number;
  liveProfitRate: number;
};

export const useHeldAssets = () => {
  const assets = useWalletAssets();
  const markets = useMarkets({ quote: "KRW", onlyActive: true });

  // Stabilize heldMarketCodes using string key
  const marketCodesKey = assets.data?.map((asset) => asset.marketCode).join(",") || "";
  const heldMarketCodes = useMemo(() => {
    if (!marketCodesKey) return [];
    return marketCodesKey.split(",");
  }, [marketCodesKey]);

  const tickers = useMarketTickers(heldMarketCodes);

  // Separate marketMap outside heldAssets useMemo
  const marketMap = useMemo(
    () =>
      new Map(
        (markets.data || []).map((market) => [
          `KRW-${market.symbol}`,
          { koreanName: market.koreanName, symbol: market.symbol },
        ]),
      ),
    [markets.data],
  );

  const heldAssets = useMemo(() => {
    if (!assets.data) return [];

    return assets.data.map((asset) => {
      const marketInfo = marketMap.get(asset.marketCode);
      const koreanName = marketInfo?.koreanName || asset.symbol;
      const symbolPair = `${asset.symbol}/KRW`;

      const ticker = tickers?.[asset.marketCode];
      const livePrice = ticker ? Number(ticker.tradePrice) : asset.currentPrice;
      const liveEvaluatedAmount = livePrice * asset.quantity;
      const liveProfitAmount = liveEvaluatedAmount - asset.totalCost;
      const liveProfitRate = asset.totalCost > 0 ? liveProfitAmount / asset.totalCost : 0;

      return {
        ...asset,
        koreanName,
        symbolPair,
        livePrice,
        liveEvaluatedAmount,
        liveProfitAmount,
        liveProfitRate,
      };
    });
  }, [assets.data, marketMap, tickers]);

  return {
    data: heldAssets,
    isLoading: assets.isLoading || markets.isLoading,
    error: assets.error || markets.error,
    isFetching: assets.isFetching || markets.isFetching,
  };
};
