import type { OrderbookResponse } from "@dobbit/shared";
import { describe, expect, it } from "vitest";

import { toOrderbookViewModel } from "./orderbook-view-model";

const unit = (price: number, askSize: number, bidSize: number): OrderbookResponse["units"][number] => ({
  askPrice: price + 1,
  bidPrice: price,
  askSize,
  bidSize,
});

describe("toOrderbookViewModel", () => {
  it("returns an empty view model when units are empty", () => {
    expect(toOrderbookViewModel([])).toEqual({ asks: [], bids: [], isEmpty: true });
  });

  it("keeps depth percentages at zero when every size is zero", () => {
    const viewModel = toOrderbookViewModel([unit(100, 0, 0)]);

    expect(viewModel.asks[0]?.volumePercent).toBe(0);
    expect(viewModel.bids[0]?.volumePercent).toBe(0);
  });

  it("reverses asks while retaining bid order", () => {
    const viewModel = toOrderbookViewModel([unit(100, 1, 2), unit(200, 3, 4)]);

    expect(viewModel.asks.map((row) => row.price)).toEqual([201, 101]);
    expect(viewModel.bids.map((row) => row.price)).toEqual([100, 200]);
    expect(viewModel.asks[0]?.volumePercent).toBe(75);
    expect(viewModel.bids[1]?.volumePercent).toBe(100);
  });

  it("limits each side to first fifteen units", () => {
    const viewModel = toOrderbookViewModel(Array.from({ length: 16 }, (_, index) => unit(index, 1, 1)));

    expect(viewModel.asks).toHaveLength(15);
    expect(viewModel.bids).toHaveLength(15);
    expect(viewModel.asks[0]?.price).toBe(15);
    expect(viewModel.bids[14]?.price).toBe(14);
  });
});
