import { AMBIGUOUS_MARKET_SYMBOLS, type TaggableMarket } from './market-tagger';

export const buildCoinSearchKeywords = (markets: readonly TaggableMarket[]): string[] => {
  const keywords = new Set<string>();

  for (const market of markets) {
    if (AMBIGUOUS_MARKET_SYMBOLS.has(market.symbol) || market.koreanName.length < 2) {
      continue;
    }

    keywords.add(`${market.koreanName} 코인`);
  }

  return [...keywords];
};
