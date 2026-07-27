import { describe, expect, it } from "vitest";

import type { HeldAsset } from "./useHeldAssets";
import { calculateWalletInvestmentSummary } from "./wallet-investment-summary";

const asset = (overrides: Partial<HeldAsset> = {}): HeldAsset => ({
  marketCode: "KRW-BTC",
  symbol: "BTC",
  koreanName: "비트코인",
  symbolPair: "BTC/KRW",
  quantity: 2,
  averagePrice: 10_000,
  totalCost: 20_000,
  currentPrice: 0,
  evaluatedAmount: 0,
  profitAmount: 0,
  profitRate: 0,
  isPriceAvailable: true,
  livePrice: 15_000,
  liveEvaluatedAmount: 30_000,
  liveProfitAmount: 10_000,
  liveProfitRate: 0.5,
  ...overrides,
});

describe("calculateWalletInvestmentSummary", () => {
  it("returns cash-only totals with no assets", () => {
    expect(calculateWalletInvestmentSummary([], 5_000)).toMatchObject({
      assets: [],
      cashAmount: 5_000,
      totalAssetAmount: 5_000,
      totalPurchaseAmount: 0,
      totalEvaluatedAmount: 0,
      totalProfitAmount: 0,
      totalProfitRate: 0,
      allocation: [],
    });
  });

  it("keeps allocation empty when live evaluation total is zero", () => {
    const unavailable = asset({
      isPriceAvailable: false,
      liveEvaluatedAmount: 0,
      liveProfitAmount: 0,
      liveProfitRate: 0,
    });

    expect(calculateWalletInvestmentSummary([unavailable], 0).allocation).toEqual([]);
  });

  it("calculates totals and allocation from positive live evaluations only", () => {
    const eth = asset({
      marketCode: "KRW-ETH",
      symbol: "ETH",
      liveEvaluatedAmount: 10_000,
      liveProfitAmount: -2_000,
      totalCost: 12_000,
    });
    const unavailable = asset({
      marketCode: "KRW-XRP",
      symbol: "XRP",
      isPriceAvailable: false,
      liveEvaluatedAmount: 0,
      liveProfitAmount: 0,
    });
    const summary = calculateWalletInvestmentSummary([asset(), eth, unavailable], 5_000);

    expect(summary).toMatchObject({
      totalAssetAmount: 45_000,
      totalPurchaseAmount: 52_000,
      totalEvaluatedAmount: 40_000,
      totalProfitAmount: 8_000,
      totalProfitRate: 8_000 / 52_000,
    });
    expect(summary.allocation.map(({ asset: allocated, percentage }) => [allocated.symbol, percentage])).toEqual([
      ["BTC", 0.75],
      ["ETH", 0.25],
    ]);
  });
});
