export type TaggableMarket = { id: string; symbol: string; koreanName: string };

export const AMBIGUOUS_MARKET_SYMBOLS: ReadonlySet<string> = new Set([
  'A',
  'ANKR',
  'ARK',
  'BEAM',
  'BORA',
  'CAP',
  'CVC',
  'CYBER',
  'ELF',
  'G',
  'GAS',
  'HIVE',
  'IQ',
  'LSK',
  'MMT',
  'MOVE',
  'MTL',
  'NEO',
  'PRL',
  'RE',
  'SAND',
  'SIGN',
  'SOON',
  'SPK',
  'STEEM',
  'SUN',
]);

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const hasMarketEvidence = (text: string, market: TaggableMarket): boolean => {
  if (!text || AMBIGUOUS_MARKET_SYMBOLS.has(market.symbol)) {
    return false;
  }

  if (market.koreanName.length >= 2 && text.includes(market.koreanName)) {
    return true;
  }

  return market.symbol.length >= 3 && new RegExp(`\\b${escapeRegExp(market.symbol)}\\b`).test(text);
};

export const findMarketsInText = (text: string, markets: readonly TaggableMarket[]): TaggableMarket[] => {
  if (!text) {
    return [];
  }

  const matchedMarketIds = new Set<string>();

  return markets.filter((market) => {
    if (
      AMBIGUOUS_MARKET_SYMBOLS.has(market.symbol) ||
      market.koreanName.length < 2 ||
      !text.includes(market.koreanName) ||
      matchedMarketIds.has(market.id)
    ) {
      return false;
    }

    matchedMarketIds.add(market.id);
    return true;
  });
};
