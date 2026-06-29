import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import { HermesAnalyzer } from '../src/news/analyzers/hermes.analyzer';
import { NEWS_ANALYZER_SYSTEM_MESSAGE } from '../src/news/analyzers/news-analyzer';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn((error: unknown) => Boolean((error as { isAxiosError?: boolean }).isAxiosError)),
  },
}));

const mockedAxios = vi.mocked(axios);
const expectedSystemMessage =
  'You are a financial news analysis engine. Return only valid JSON matching the requested schema. Do not include markdown. Do not use tools. Analyze only the provided news content.';

const createConfig = (values: Record<string, string>): ConfigService =>
  ({
    get: <T>(key: string, defaultValue?: T): T | string | undefined => values[key] ?? defaultValue,
  }) as ConfigService;

const validAnalysis = {
  sentiment: 'positive',
  confidence: 0.82,
  investment_index: 0.45,
  keywords: ['BTC', 'ETF'],
  reason: '기관 수요 증가',
  related_markets: ['BTC'],
};

const mockHermesResponse = (content: string) => {
  mockedAxios.post.mockResolvedValueOnce({
    data: {
      choices: [{ message: { content } }],
    },
  });
};

describe('HermesAnalyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the required shared system message', () => {
    expect(NEWS_ANALYZER_SYSTEM_MESSAGE).toBe(expectedSystemMessage);
  });

  it('uses env model, timeout, and system message in OpenAI-compatible request', async () => {
    const analyzer = new HermesAnalyzer(
      createConfig({
        HERMES_BASE_URL: 'https://hermes.local',
        HERMES_API_KEY: 'test-key',
        HERMES_MODEL: 'custom-hermes',
        HERMES_TIMEOUT_MS: '15000',
      }),
    );
    mockHermesResponse(JSON.stringify(validAnalysis));

    await analyzer.analyze('비트코인 ETF 자금 유입');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://hermes.local/v1/chat/completions',
      expect.objectContaining({
        model: 'custom-hermes',
        messages: [
          expect.objectContaining({ role: 'system', content: expectedSystemMessage }),
          expect.objectContaining({ role: 'user', content: expect.stringContaining('비트코인 ETF') }),
        ],
      }),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-key' },
        timeout: 15000,
      }),
    );
  });

  it('defaults model and timeout when env values are not provided', async () => {
    const analyzer = new HermesAnalyzer(
      createConfig({
        HERMES_BASE_URL: 'https://hermes.local',
        HERMES_API_KEY: 'test-key',
      }),
    );
    mockHermesResponse(JSON.stringify(validAnalysis));

    await analyzer.analyze('시장 뉴스');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ model: 'hermes-agent' }),
      expect.objectContaining({ timeout: 30000 }),
    );
  });

  it('parses pure JSON, fenced JSON, and JSON mixed with explanation text', async () => {
    const contents = [
      JSON.stringify(validAnalysis),
      `\`\`\`json\n${JSON.stringify(validAnalysis)}\n\`\`\``,
      `분석 결과입니다.\n${JSON.stringify(validAnalysis)}\n참고하세요.`,
    ];

    for (const content of contents) {
      const analyzer = new HermesAnalyzer(
        createConfig({
          HERMES_BASE_URL: 'https://hermes.local',
          HERMES_API_KEY: 'test-key',
        }),
      );
      mockHermesResponse(content);

      const result = await analyzer.analyze('시장 뉴스');

      expect(result).toMatchObject({
        sentiment: 'positive',
        confidence: 0.82,
        investmentScore: 0.45,
        keywords: ['BTC', 'ETF'],
        reason: '기관 수요 증가',
        relatedMarkets: ['BTC'],
      });
    }
  });

  it('throws clear errors for invalid analysis values', async () => {
    const invalidResponses = [
      { ...validAnalysis, sentiment: 'bullish' },
      { ...validAnalysis, confidence: 1.2 },
      { ...validAnalysis, investment_index: -1.2 },
    ];

    for (const response of invalidResponses) {
      const analyzer = new HermesAnalyzer(
        createConfig({
          HERMES_BASE_URL: 'https://hermes.local',
          HERMES_API_KEY: 'test-key',
        }),
      );
      mockHermesResponse(JSON.stringify(response));

      await expect(analyzer.analyze('시장 뉴스')).rejects.toThrow(/sentiment|confidence|investment_index/);
    }
  });

  it('does not require GEMINI_API_KEY', async () => {
    const analyzer = new HermesAnalyzer(
      createConfig({
        HERMES_BASE_URL: 'https://hermes.local',
        HERMES_API_KEY: 'test-key',
      }),
    );
    mockHermesResponse(JSON.stringify(validAnalysis));

    await expect(analyzer.analyze('시장 뉴스')).resolves.toMatchObject({
      sentiment: 'positive',
    });
  });

  it('logs HTTP status and timeout failures distinctly', async () => {
    const httpAnalyzer = new HermesAnalyzer(
      createConfig({
        HERMES_BASE_URL: 'https://hermes.local',
        HERMES_API_KEY: 'test-key',
      }),
    );
    const httpLogger = vi.spyOn(
      (httpAnalyzer as unknown as { logger: { error: (message: string) => void } }).logger,
      'error',
    );
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 503 },
    });

    await expect(httpAnalyzer.analyze('시장 뉴스')).rejects.toMatchObject({
      response: { status: 503 },
    });
    expect(httpLogger).toHaveBeenCalledWith(expect.stringContaining('HTTP 503'));

    const timeoutAnalyzer = new HermesAnalyzer(
      createConfig({
        HERMES_BASE_URL: 'https://hermes.local',
        HERMES_API_KEY: 'test-key',
      }),
    );
    const timeoutLogger = vi.spyOn(
      (timeoutAnalyzer as unknown as { logger: { error: (message: string) => void } }).logger,
      'error',
    );
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout of 30000ms exceeded',
    });

    await expect(timeoutAnalyzer.analyze('시장 뉴스')).rejects.toMatchObject({
      code: 'ECONNABORTED',
    });
    expect(timeoutLogger).toHaveBeenCalledWith(expect.stringContaining('timeout'));
  });
});
