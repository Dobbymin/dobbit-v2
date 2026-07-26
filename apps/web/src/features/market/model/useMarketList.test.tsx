// @vitest-environment jsdom
import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMarketList } from "./useMarketList";

const mocks = vi.hoisted(() => ({
  isAuthenticated: true,
  favorites: undefined as Set<string> | undefined,
  isFavoritesLoading: false,
}));

vi.mock("@/shared", () => ({
  formatCoinPrice: (value: number) => String(value),
  useIntersectionObserver: (callback: () => void) => callback,
  useIsAuth: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock("@/features/favorite", () => ({
  useFavorites: () => ({ data: mocks.favorites, isLoading: mocks.isFavoritesLoading }),
}));

const market = (index: number): Market => ({
  id: `KRW-${index}`,
  code: `KRW-${index}`,
  koreanName: `코인${index}`,
  englishName: `Coin${index}`,
  symbol: String(index),
  isActive: true,
});

const ticker = (code: string, price: number): MarketTickerUpdatedEvent => ({
  type: "market.ticker.updated",
  marketCode: code,
  accTradeVolume24h: 1,
  tradePrice: price,
  signedChangeRate: 0,
  signedChangePrice: 0,
  timestamp: "2026-07-19T00:00:00.000Z",
});

describe("useMarketList", () => {
  const markets = Array.from({ length: 25 }, (_, index) => market(index));
  const tickers = Object.fromEntries(markets.map((item, index) => [item.code, ticker(item.code, index)]));
  const onSearchKeywordChange = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mocks.isAuthenticated = true;
    mocks.favorites = undefined;
    mocks.isFavoritesLoading = false;
    onSearchKeywordChange.mockReset();
  });

  it("debounce cleanup 뒤 최신 검색어만 전달한다", () => {
    const { result, unmount } = renderHook(() =>
      useMarketList({ activeTab: "all", markets, searchKeyword: "", tickers, onSearchKeywordChange }),
    );

    act(() => result.current.setSearchKeyword("BTC"));
    unmount();
    act(() => vi.advanceTimersByTime(300));

    expect(onSearchKeywordChange).not.toHaveBeenCalled();
  });

  it("정렬 전이를 desc, asc, 해제 순서로 적용한다", () => {
    const { result } = renderHook(() =>
      useMarketList({ activeTab: "all", markets, searchKeyword: "", tickers, onSearchKeywordChange }),
    );

    act(() => result.current.selectSort("price"));
    expect(result.current.sortKey).toBe("price");
    expect(result.current.sortDirection).toBe("desc");
    act(() => result.current.selectSort("price"));
    expect(result.current.sortDirection).toBe("asc");
    act(() => result.current.selectSort("price"));
    expect(result.current.sortKey).toBeNull();
  });

  it("검색과 observer가 visible count를 reset하고 증가시킨다", () => {
    const { result } = renderHook(() =>
      useMarketList({ activeTab: "all", markets, searchKeyword: "", tickers, onSearchKeywordChange }),
    );

    expect(result.current.visibleCount).toBe(20);
    act(() => result.current.observerRef(null));
    expect(result.current.visibleCount).toBe(40);
    act(() => result.current.setSearchKeyword("코인"));
    expect(result.current.visibleCount).toBe(20);
  });
});
