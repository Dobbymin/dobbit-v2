import type { CandleResponse } from "@dobbit/shared";

/**
 * CandleResponse 배열을 ApexCharts 캔들스틱 차트용 시리즈로 변환하는 순수 함수
 *
 * @param candles - CandleResponse 배열 (ascending 정렬됨)
 * @returns ApexCharts series format: { x: Date, y: [open, high, low, close] }[]
 */
export const toCandleSeries = (candles: CandleResponse[]): Array<{ x: Date; y: [number, number, number, number] }> => {
  return candles.map((candle) => ({
    x: new Date(candle.candleDateTime),
    y: [candle.openingPrice, candle.highPrice, candle.lowPrice, candle.tradePrice],
  }));
};

/**
 * 마지막 캔들을 실시간 tradePrice로 갱신하는 순수 함수
 * close는 tradePrice로, high와 low는 필요시 갱신됨
 *
 * @param series - ApexCharts series 배열
 * @param tradePrice - 실시간 가격
 * @returns 수정된 series
 */
export const updateLastCandleWithTicker = (
  series: Array<{ x: Date; y: [number, number, number, number] }>,
  tradePrice: number,
): Array<{ x: Date; y: [number, number, number, number] }> => {
  if (series.length === 0) {
    return series;
  }

  const lastCandle = series[series.length - 1]!;
  const [open, currentHigh, currentLow] = lastCandle.y;

  const updatedSeries = [...series];
  updatedSeries[series.length - 1] = {
    x: lastCandle.x,
    y: [open, Math.max(currentHigh, tradePrice), Math.min(currentLow, tradePrice), tradePrice],
  };

  return updatedSeries;
};
