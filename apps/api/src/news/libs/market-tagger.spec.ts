import { describe, expect, it } from 'vitest';
import { findMarketsInText, hasMarketEvidence, type TaggableMarket } from './market-tagger';

const markets: TaggableMarket[] = [
  { id: 'btc', symbol: 'BTC', koreanName: '비트코인' },
  { id: 'eth', symbol: 'ETH', koreanName: '이더리움' },
];

describe('findMarketsInText', () => {
  it('matches only market whose Korean name appears in text', () => {
    expect(findMarketsInText('비트코인 시세가 상승했다', markets)).toEqual([markets[0]]);
  });

  it('skips ambiguous market symbols even when Korean name appears in text', () => {
    expect(findMarketsInText('사이버 보안 사고', [{ id: 'cyber', symbol: 'CYBER', koreanName: '사이버' }])).toEqual([]);
  });

  it('returns a market once when Korean name appears multiple times', () => {
    const text = '비트코인 전망\n비트코인 시세 상승';

    expect(findMarketsInText(text, markets)).toEqual([markets[0]]);
  });

  it('returns no markets for empty text', () => {
    expect(findMarketsInText('', markets)).toEqual([]);
  });
});

describe('hasMarketEvidence', () => {
  const bitcoin: TaggableMarket = { id: 'btc', symbol: 'BTC', koreanName: '비트코인' };

  it('matches Korean name in text', () => {
    expect(hasMarketEvidence('비트코인 시세가 상승했다', bitcoin)).toBe(true);
  });

  it('matches uppercase symbol at word boundaries', () => {
    expect(hasMarketEvidence('BTC 급등', bitcoin)).toBe(true);
  });

  it('does not match a symbol embedded in another word', () => {
    expect(hasMarketEvidence('BTCUSD 차트', bitcoin)).toBe(false);
  });

  it('does not match a lowercase symbol', () => {
    expect(hasMarketEvidence('btc 급등', bitcoin)).toBe(false);
  });

  it('returns false without Korean name or symbol evidence', () => {
    expect(hasMarketEvidence('이더리움 시세가 상승했다', bitcoin)).toBe(false);
  });

  it('returns false for empty text', () => {
    expect(hasMarketEvidence('', bitcoin)).toBe(false);
  });

  it('rejects an ambiguous market even when its Korean name appears', () => {
    expect(hasMarketEvidence('사이버 보안 사고', { id: 'cyber', symbol: 'CYBER', koreanName: '사이버' })).toBe(false);
  });

  it('does not match symbols shorter than three characters', () => {
    expect(hasMarketEvidence('AB 급등', { id: 'ab', symbol: 'AB', koreanName: '에이비' })).toBe(false);
  });
});
