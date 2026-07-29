import type { Market, TradeResponse } from "@dobbit/shared";
import { describe, expect, it } from "vitest";

import { toTradeHistoryRows } from "./trade-history-row";

const market: Market = {
  id: "bitcoin",
  code: "KRW-BTC",
  symbol: "BTC",
  koreanName: "비트코인",
  englishName: "Bitcoin",
  isActive: true,
};

const trade = (marketCode: string, side: TradeResponse["side"]): TradeResponse => ({
  id: `${marketCode}-${side}`,
  marketCode,
  side,
  price: 12345,
  quantity: 1.234567891,
  totalAmount: 15241.5789,
  fee: 0,
  executedAt: "2026-07-27T01:02:00.000Z",
});

describe("toTradeHistoryRows", () => {
  it("joins market names and creates display values", () => {
    expect(toTradeHistoryRows([trade("KRW-BTC", "BUY")], [market])).toEqual([
      {
        id: "KRW-BTC-BUY",
        executedAt: "07.27 10:02",
        executedAtFull: "2026.07.27 10:02",
        fee: "0",
        koreanName: "비트코인",
        price: "12,345",
        quantity: "1.23456789",
        sideLabel: "매수",
        sideTone: "increase",
        symbolPair: "BTC/KRW",
        totalAmount: "15,242",
      },
    ]);
  });

  it("uses market code symbol when market metadata is absent", () => {
    const [row] = toTradeHistoryRows([trade("KRW-XRP", "SELL")], []);

    expect(row).toMatchObject({ koreanName: "XRP", sideLabel: "매도", sideTone: "decrease", symbolPair: "XRP/KRW" });
  });
});
