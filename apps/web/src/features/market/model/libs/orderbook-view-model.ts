import type { OrderbookResponse } from "@dobbit/shared";

type OrderbookUnit = OrderbookResponse["units"][number];

export type OrderbookRow = {
  price: number;
  size: number;
  volumePercent: number;
};

export type OrderbookViewModel = {
  asks: OrderbookRow[];
  bids: OrderbookRow[];
  isEmpty: boolean;
};

const ROW_COUNT = 15;

export const toOrderbookViewModel = (units: OrderbookUnit[]): OrderbookViewModel => {
  const topUnits = units.slice(0, ROW_COUNT);
  const maxSize = Math.max(...topUnits.flatMap((unit) => [unit.askSize, unit.bidSize]), 0);
  const toVolumePercent = (size: number) => (maxSize > 0 ? (size / maxSize) * 100 : 0);

  return {
    asks: [...topUnits].reverse().map((unit) => ({
      price: unit.askPrice,
      size: unit.askSize,
      volumePercent: toVolumePercent(unit.askSize),
    })),
    bids: topUnits.map((unit) => ({
      price: unit.bidPrice,
      size: unit.bidSize,
      volumePercent: toVolumePercent(unit.bidSize),
    })),
    isEmpty: units.length === 0,
  };
};
