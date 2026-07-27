import { formatCoinPrice, formatPrice } from "@/shared";
import type { Market, TradeResponse } from "@dobbit/shared";
import dayjs from "dayjs";

export type TradeHistoryRow = {
  id: string;
  executedAt: string;
  koreanName: string;
  price: string;
  quantity: string;
  sideLabel: "매수" | "매도";
  sideTone: "increase" | "decrease";
  symbolPair: string;
  totalAmount: string;
};

export const toTradeHistoryRows = (trades: TradeResponse[], markets: Market[]): TradeHistoryRow[] => {
  const marketMap = new Map(markets.map((market) => [market.code, market]));

  return trades.map((trade) => {
    const market = marketMap.get(trade.marketCode);
    const symbol = market?.symbol ?? trade.marketCode.replace("KRW-", "");
    const isBuy = trade.side === "BUY";

    return {
      id: trade.id,
      executedAt: dayjs(trade.executedAt).format("MM.DD HH:mm"),
      koreanName: market?.koreanName ?? symbol,
      price: formatCoinPrice(trade.price),
      quantity: trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 }),
      sideLabel: isBuy ? "매수" : "매도",
      sideTone: isBuy ? "increase" : "decrease",
      symbolPair: `${symbol}/KRW`,
      totalAmount: formatPrice(trade.totalAmount),
    };
  });
};
