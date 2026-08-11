import type { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = { get: vi.fn() };

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => http),
    isAxiosError: vi.fn(() => false),
  },
}));

import { NaverNewsCollector } from './naver-news.collector';

const createConfig = (values: Record<string, string | number | undefined>): ConfigService =>
  ({
    get: <T>(key: string, defaultValue?: T): T | string | number | undefined => values[key] ?? defaultValue,
  }) as ConfigService;

type NaverNewsRequestOptions = {
  params: {
    display: number;
    query: string;
  };
};

const displays = () =>
  http.get.mock.calls.map(([, options]: [string, NaverNewsRequestOptions]) => options.params.display);
const queries = () => http.get.mock.calls.map(([, options]: [string, NaverNewsRequestOptions]) => options.params.query);

describe('NaverNewsCollector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: { items: [] } });
  });

  it('collects only default keywords with NEWS_NAVER_DISPLAY when no extra keywords exist', async () => {
    const collector = new NaverNewsCollector(
      createConfig({ NAVER_CLIENT_ID: 'id', NAVER_CLIENT_SECRET: 'secret', NEWS_NAVER_DISPLAY: 5 }),
    );

    await collector.collect();

    expect(queries()).toEqual(['비트코인', '이더리움', '가상자산', '암호화폐', '블록체인']);
    expect(displays()).toEqual([5, 5, 5, 5, 5]);
  });

  it('collects extra coin keywords after defaults with NEWS_NAVER_COIN_DISPLAY', async () => {
    const collector = new NaverNewsCollector(
      createConfig({
        NAVER_CLIENT_ID: 'id',
        NAVER_CLIENT_SECRET: 'secret',
        NEWS_NAVER_DISPLAY: 5,
        NEWS_NAVER_COIN_DISPLAY: 2,
      }),
    );

    await collector.collect(['솔라나 코인', '제로베이스 코인']);

    expect(queries()).toEqual([
      '비트코인',
      '이더리움',
      '가상자산',
      '암호화폐',
      '블록체인',
      '솔라나 코인',
      '제로베이스 코인',
    ]);
    expect(displays()).toEqual([5, 5, 5, 5, 5, 2, 2]);
  });

  it.each([
    [undefined, 2],
    [0, 1],
    [101, 100],
    ['invalid', 2],
  ])('clamps NEWS_NAVER_COIN_DISPLAY=%s to %i', async (configured, expected) => {
    const collector = new NaverNewsCollector(
      createConfig({
        NAVER_CLIENT_ID: 'id',
        NAVER_CLIENT_SECRET: 'secret',
        NEWS_NAVER_COIN_DISPLAY: configured,
      }),
    );

    await collector.collect(['솔라나 코인']);

    expect(displays().at(-1)).toBe(expected);
  });

  it('stops collection after rate limit and returns already collected items', async () => {
    const firstItem = {
      title: '첫 기사',
      description: '첫 내용',
      link: 'https://example.com/first',
      pubDate: 'Mon, 01 Jan 2024 00:00:00 +0900',
    };
    const rateLimitError = { response: { status: 429 } };

    http.get.mockResolvedValueOnce({ data: { items: [firstItem] } }).mockRejectedValueOnce(rateLimitError);
    vi.mocked(axios.isAxiosError).mockImplementation((error) => error === rateLimitError);

    const collector = new NaverNewsCollector(createConfig({ NAVER_CLIENT_ID: 'id', NAVER_CLIENT_SECRET: 'secret' }));

    await expect(collector.collect(['솔라나 코인'])).resolves.toEqual([
      expect.objectContaining({ title: '첫 기사', url: 'https://example.com/first' }),
    ]);
    expect(queries()).toEqual(['비트코인', '이더리움']);
  });

  it('continues collection after non-rate-limit error', async () => {
    const requestError = new Error('Network error');

    http.get.mockRejectedValueOnce(requestError).mockResolvedValueOnce({ data: { items: [] } });

    const collector = new NaverNewsCollector(createConfig({ NAVER_CLIENT_ID: 'id', NAVER_CLIENT_SECRET: 'secret' }));

    await collector.collect();

    expect(queries()).toEqual(['비트코인', '이더리움', '가상자산', '암호화폐', '블록체인']);
  });
});
