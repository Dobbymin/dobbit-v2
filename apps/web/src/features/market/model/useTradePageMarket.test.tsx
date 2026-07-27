// @vitest-environment jsdom
import type { Market } from "@dobbit/shared";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTradePageMarket } from "./useTradePageMarket";

const replace = vi.fn();
const record = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("./useRecentlyViewed", () => ({ useRecentlyViewed: () => ({ record }) }));

const market: Market = {
  id: "bitcoin",
  code: "KRW-BTC",
  symbol: "BTC",
  koreanName: "비트코인",
  englishName: "Bitcoin",
  isActive: true,
};

describe("useTradePageMarket", () => {
  beforeEach(() => {
    replace.mockReset();
    record.mockReset();
  });

  it("redirects an invalid loaded market to Bitcoin", () => {
    renderHook(() => useTradePageMarket({ marketCode: "KRW-NOTFOUND", markets: [market], isMarketsLoading: false }));

    expect(replace).toHaveBeenCalledWith("/trade/KRW-BTC");
    expect(record).not.toHaveBeenCalled();
  });

  it("waits for a non-empty loaded market list before redirecting", () => {
    const { rerender } = renderHook(
      ({ isMarketsLoading, markets }) => useTradePageMarket({ marketCode: "KRW-NOTFOUND", markets, isMarketsLoading }),
      { initialProps: { isMarketsLoading: true, markets: [market] } },
    );

    expect(replace).not.toHaveBeenCalled();
    rerender({ isMarketsLoading: false, markets: [] });
    expect(replace).not.toHaveBeenCalled();
  });

  it("returns selected market and records it", () => {
    const { result } = renderHook(() =>
      useTradePageMarket({ marketCode: "KRW-BTC", markets: [market], isMarketsLoading: false }),
    );

    expect(result.current.selectedMarket).toBe(market);
    expect(record).toHaveBeenCalledWith("KRW-BTC");
    expect(replace).not.toHaveBeenCalled();
  });
});
