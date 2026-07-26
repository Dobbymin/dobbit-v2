// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useHeldAssets } from "./useHeldAssets";

const mocks = vi.hoisted(() => ({
  tickers: {} as Record<string, { tradePrice: number }>,
  useWalletAssets: vi.fn(),
  useMarkets: vi.fn(),
}));

vi.mock("@/features/market/model", () => ({
  useMarketTickers: () => mocks.tickers,
  useMarkets: mocks.useMarkets,
}));

vi.mock("./useWalletAssets", () => ({
  useWalletAssets: mocks.useWalletAssets,
}));

const holding = {
  marketCode: "KRW-BTC",
  symbol: "BTC",
  quantity: 2,
  averagePrice: 10_000,
  totalCost: 20_000,
  currentPrice: 0,
  evaluatedAmount: 0,
  profitAmount: 0,
  profitRate: 0,
};

describe("useHeldAssets", () => {
  beforeEach(() => {
    mocks.tickers = {};
    mocks.useWalletAssets.mockReturnValue({ data: [holding], isLoading: false, error: null, isFetching: false });
    mocks.useMarkets.mockReturnValue({
      data: [{ symbol: "BTC", koreanName: "비트코인" }],
      isLoading: false,
      error: null,
      isFetching: false,
    });
  });

  it("marks a zero API fallback without a ticker as unavailable", () => {
    const { result } = renderHook(() => useHeldAssets());

    expect(result.current.data[0]).toMatchObject({
      isPriceAvailable: false,
      liveEvaluatedAmount: 0,
      liveProfitAmount: 0,
      liveProfitRate: 0,
    });
  });

  it("recalculates when a positive ticker arrives", () => {
    const { result, rerender } = renderHook(() => useHeldAssets());

    mocks.tickers = { "KRW-BTC": { tradePrice: 15_000 } };
    rerender();

    expect(result.current.data[0]).toMatchObject({
      isPriceAvailable: true,
      livePrice: 15_000,
      liveEvaluatedAmount: 30_000,
      liveProfitAmount: 10_000,
      liveProfitRate: 0.5,
    });
  });

  it("uses a positive API price before a ticker arrives", () => {
    mocks.useWalletAssets.mockReturnValue({
      data: [{ ...holding, currentPrice: 12_000 }],
      isLoading: false,
      error: null,
      isFetching: false,
    });

    const { result } = renderHook(() => useHeldAssets());

    expect(result.current.data[0]).toMatchObject({
      isPriceAvailable: true,
      livePrice: 12_000,
      liveEvaluatedAmount: 24_000,
      liveProfitAmount: 4_000,
      liveProfitRate: 0.2,
    });
  });
});
