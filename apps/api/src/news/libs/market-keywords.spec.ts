import { describe, expect, it } from 'vitest';
import { buildCoinSearchKeywords } from './market-keywords';

describe('buildCoinSearchKeywords', () => {
  it('builds unique Korean coin search keywords in market order', () => {
    expect(
      buildCoinSearchKeywords([
        { id: 'btc', symbol: 'BTC', koreanName: '비트코인' },
        { id: 'sol', symbol: 'SOL', koreanName: '솔라나' },
        { id: 'sol-duplicate', symbol: 'SOL2', koreanName: '솔라나' },
      ]),
    ).toEqual(['비트코인 코인', '솔라나 코인']);
  });

  it('excludes ambiguous symbols and Korean names shorter than two characters', () => {
    expect(
      buildCoinSearchKeywords([
        { id: 'cyber', symbol: 'CYBER', koreanName: '사이버' },
        { id: 'one-character', symbol: 'ONE', koreanName: '원' },
        { id: 'empty', symbol: 'EMPTY', koreanName: '' },
        { id: 'eth', symbol: 'ETH', koreanName: '이더리움' },
      ]),
    ).toEqual(['이더리움 코인']);
  });
});
