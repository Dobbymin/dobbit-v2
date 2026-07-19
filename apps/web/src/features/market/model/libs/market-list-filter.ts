import type { Market, MarketTickerUpdatedEvent } from "@dobbit/shared";

export const filterFavoriteMarkets = (markets: Market[], favoriteCodes: Set<string>) =>
  markets.filter((market) => favoriteCodes.has(market.code));

export const getTopMarketsByTradeVolume = (
  markets: Market[],
  tickers: Record<string, MarketTickerUpdatedEvent>,
  limit = 10,
) => {
  // accTradeVolume24h × tradePrice는 정확한 24h 거래대금이 아닌 근사값이다.
  return markets
    .filter((market) => {
      const ticker = tickers[market.code];
      return ticker && Number.isFinite(ticker.accTradeVolume24h) && Number.isFinite(ticker.tradePrice);
    })
    .sort((a, b) => {
      const aTicker = tickers[a.code];
      const bTicker = tickers[b.code];
      const aValue = aTicker ? aTicker.accTradeVolume24h * aTicker.tradePrice : Number.NEGATIVE_INFINITY;
      const bValue = bTicker ? bTicker.accTradeVolume24h * bTicker.tradePrice : Number.NEGATIVE_INFINITY;
      return bValue - aValue;
    })
    .slice(0, limit);
};
