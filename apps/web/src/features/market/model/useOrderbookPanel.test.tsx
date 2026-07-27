// @vitest-environment jsdom
import type { OrderbookResponse } from "@dobbit/shared";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useOrderbookPanel } from "./useOrderbookPanel";

const useOrderbook = vi.fn();

vi.mock("./useOrderbook", () => ({ useOrderbook: (...args: unknown[]) => useOrderbook(...args) }));

describe("useOrderbookPanel", () => {
  it("exposes loading state while orderbook data is unavailable", () => {
    useOrderbook.mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useOrderbookPanel("KRW-BTC"));

    expect(useOrderbook).toHaveBeenCalledWith("KRW-BTC");
    expect(result.current).toMatchObject({ asks: [], bids: [], isEmpty: true, isLoading: true });
  });

  it("builds rows from fetched orderbook units", () => {
    const units: OrderbookResponse["units"] = [{ askPrice: 101, bidPrice: 100, askSize: 2, bidSize: 4 }];
    useOrderbook.mockReturnValue({ data: { units }, isLoading: false });

    const { result } = renderHook(() => useOrderbookPanel("KRW-BTC"));

    expect(result.current).toMatchObject({ isEmpty: false, isLoading: false });
    expect(result.current.asks[0]).toMatchObject({ price: 101, size: 2, volumePercent: 50 });
  });
});
