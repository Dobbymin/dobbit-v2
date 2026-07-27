// @vitest-environment jsdom
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWatchlistPanel } from "./useWatchlistPanel";

const mocks = vi.hoisted(() => ({
  favorites: undefined as Set<string> | undefined,
  headlines: [] as { title: string }[],
  isAuthenticated: true,
}));

vi.mock("@/shared", () => ({
  formatCoinPrice: (value: number) => String(value),
  useIsAuth: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock("@/features/favorite", () => ({
  useFavorites: () => ({ data: mocks.favorites }),
}));

vi.mock("@/features/news", () => ({
  useNews: () => ({ data: mocks.headlines }),
}));

const markets: Market[] = [
  { id: "KRW-BTC", code: "KRW-BTC", koreanName: "비트코인", englishName: "Bitcoin", symbol: "BTC", isActive: true },
];
const tickers: Record<string, MarketTickerUpdatedEvent> = {
  "KRW-BTC": {
    type: "market.ticker.updated",
    marketCode: "KRW-BTC",
    accTradeVolume24h: 1,
    tradePrice: 100,
    signedChangeRate: 0,
    signedChangePrice: 0,
    timestamp: "2026-07-26T00:00:00.000Z",
  },
};

describe("useWatchlistPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.favorites = new Set();
    mocks.headlines = [];
    mocks.isAuthenticated = true;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("rotates headlines every four seconds", () => {
    mocks.headlines = [{ title: "첫 뉴스" }, { title: "둘째 뉴스" }];
    const { result } = renderHook(() => useWatchlistPanel(markets, tickers));

    expect(result.current.headline).toBe("첫 뉴스");
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.headline).toBe("둘째 뉴스");
  });

  it.each([{ headlines: [] }, { headlines: [{ title: "한 뉴스" }] }])(
    "does not create an interval for $headlines headlines",
    ({ headlines }) => {
      mocks.headlines = headlines;
      const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

      renderHook(() => useWatchlistPanel(markets, tickers));

      expect(setIntervalSpy).not.toHaveBeenCalled();
    },
  );

  it("cleans up interval on unmount", () => {
    mocks.headlines = [{ title: "첫 뉴스" }, { title: "둘째 뉴스" }];
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = renderHook(() => useWatchlistPanel(markets, tickers));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledOnce();
  });

  it("resets headline when headline count changes", () => {
    mocks.headlines = [{ title: "첫 뉴스" }, { title: "둘째 뉴스" }];
    const { result, rerender } = renderHook(() => useWatchlistPanel(markets, tickers));
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.headline).toBe("둘째 뉴스");

    mocks.headlines = [{ title: "새 첫 뉴스" }, { title: "새 둘째 뉴스" }, { title: "새 셋째 뉴스" }];
    rerender();

    expect(result.current.headline).toBe("새 첫 뉴스");
  });
});
