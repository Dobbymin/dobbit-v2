import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

import { formatCoinPrice } from "@/shared";

export type MarketRowData = {
  code: string;
  koreanName: string;
  symbolPair: string;
  tradePrice: string;
  changeRate: string;
  changeTone: "increase" | "decrease" | "neutral";
  isActive: boolean;
};

/**
 * Market과 실시간 ticker를 조합하여 마켓 행 데이터로 변환하는 순수 함수
 *
 * @param market - Market 정보
 * @param ticker - 실시간 MarketTickerUpdatedEvent (선택사항)
 * @returns 마켓 행 표시 데이터
 */
export const toMarketRow = (market: Market, ticker?: MarketTickerUpdatedEvent | null): MarketRowData => {
  const symbolPair = market.code.replace("KRW-", "") + "/KRW";

  // 가격 포맷
  const tradePrice = ticker ? formatCoinPrice(Number(ticker.tradePrice)) : "-";

  // 변동률 포맷
  let changeRate: string;
  if (ticker) {
    const ratePercent = (ticker.signedChangeRate * 100).toFixed(2);
    const sign = ticker.signedChangeRate >= 0 ? "+" : "";
    changeRate = `${sign}${ratePercent}%`;
  } else {
    changeRate = market.isActive ? "0.00%" : "중지";
  }

  // 상승/하락/중립 톤
  let changeTone: "increase" | "decrease" | "neutral";
  if (ticker) {
    if (ticker.signedChangeRate > 0) {
      changeTone = "increase";
    } else if (ticker.signedChangeRate < 0) {
      changeTone = "decrease";
    } else {
      changeTone = "neutral";
    }
  } else {
    changeTone = "neutral";
  }

  return {
    code: market.code,
    koreanName: market.koreanName,
    symbolPair,
    tradePrice,
    changeRate,
    changeTone,
    isActive: market.isActive,
  };
};
