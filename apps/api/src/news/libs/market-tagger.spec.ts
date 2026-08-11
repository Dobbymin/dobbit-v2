import { describe, expect, it } from 'vitest';
import { findMarketsInText, type TaggableMarket } from './market-tagger';

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
