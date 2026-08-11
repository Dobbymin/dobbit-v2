import type { ConfigService } from '@nestjs/config';
import { Decimal as PrismaDecimal } from '@prisma/client/runtime/library';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AlertService } from '../src/alert/alert.service';
import type { PrismaService } from '../src/common/prisma/prisma.service';
import type { UpbitApiClient } from '../src/market/external/upbit-api.client';
import type { GeminiAnalyzer } from '../src/news/analyzers/gemini.analyzer';
import type { HermesAnalyzer } from '../src/news/analyzers/hermes.analyzer';
import type { AnalysisResult } from '../src/news/analyzers/news-analyzer';
import type { NaverNewsCollector } from '../src/news/collectors/naver-news.collector';
import { NewsService } from '../src/news/news.service';

const analysisResult: AnalysisResult = {
  sentiment: 'positive',
  confidence: 0.8,
  investmentScore: 0.35,
  keywords: ['BTC'],
  reason: '기관 수요 증가',
  relatedMarkets: [],
};

const newsItem = {
  source: 'NAVER',
  title: 'BTC ETF 자금 유입',
  url: 'https://news.example.com/btc-etf',
  publishedAt: new Date('2026-06-18T00:00:00.000Z'),
  content: 'BTC ETF 자금 유입이 증가했다.',
};

const createConfig = (values: Record<string, string | undefined>): ConfigService =>
  ({
    get: <T>(key: string, defaultValue?: T): T | string | undefined => values[key] ?? defaultValue,
  }) as ConfigService;

const createPrisma = () => {
  const run = {
    id: 'run-1',
    status: 'RUNNING',
    targetDate: new Date('2026-06-18T00:00:00.000Z'),
    requestedBy: 'TEST',
    totalCount: 0,
    successCount: 0,
    failedCount: 0,
    errorMessage: null,
    startedAt: new Date('2026-06-18T00:00:00.000Z'),
    finishedAt: null,
  };

  return {
    newsAnalysisRun: {
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockResolvedValue(run),
      update: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          ...run,
          ...data,
          requestedBy: run.requestedBy,
          targetDate: run.targetDate,
          errorMessage: data.errorMessage ?? null,
        }),
      ),
    },
    newsArticle: {
      upsert: vi.fn().mockResolvedValue({
        id: 'article-1',
        title: newsItem.title,
        url: newsItem.url,
      }),
    },
    market: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
    },
    newsMarketTag: {
      upsert: vi.fn(),
    },
    newsAnalysis: {
      upsert: vi.fn().mockResolvedValue({
        id: 'analysis-1',
        investmentScore: 0.35,
        sentiment: 'POSITIVE',
      }),
    },
    predictionReview: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  } as unknown as PrismaService;
};

const createService = ({
  configValues,
  hermesAnalyze,
  geminiAnalyze,
  items = [newsItem],
}: {
  configValues: Record<string, string | undefined>;
  hermesAnalyze: ReturnType<typeof vi.fn>;
  geminiAnalyze: ReturnType<typeof vi.fn>;
  items?: typeof newsItem[];
}) => {
  const prisma = createPrisma();
  const naverCollector = {
    collect: vi.fn().mockResolvedValue(items),
  } as unknown as NaverNewsCollector;
  const hermesAnalyzer = {
    analyze: hermesAnalyze,
  } as unknown as HermesAnalyzer;
  const geminiAnalyzer = {
    analyze: geminiAnalyze,
  } as unknown as GeminiAnalyzer;
  const alertService = {
    evaluateNewsSentiment: vi.fn(),
  } as unknown as AlertService;

  const service = new NewsService(
    prisma,
    naverCollector,
    hermesAnalyzer,
    geminiAnalyzer,
    alertService,
    {} as UpbitApiClient,
    createConfig(configValues),
  );

  const logger = {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  vi.spyOn(service as unknown as { logger: { warn: (message: string) => void } }, 'logger', 'get').mockReturnValue(
    logger as never,
  );

  return { service, prisma, naverCollector, alertService, logger };
};

describe('NewsService analyzer provider routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provider='hermes' uses Hermes only and does not fall back to Gemini without a key", async () => {
    const hermesError = new Error('Hermes unavailable');
    const hermesAnalyze = vi.fn().mockRejectedValue(hermesError);
    const geminiAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const { service } = createService({
      configValues: {
        NEWS_ANALYSIS_PROVIDER: 'hermes',
        NEWS_ANALYZER_FALLBACK: 'gemini',
        GEMINI_API_KEY: undefined,
      },
      hermesAnalyze,
      geminiAnalyze,
    });

    const result = await service.ingest('TEST');

    expect(hermesAnalyze).toHaveBeenCalledOnce();
    expect(geminiAnalyze).not.toHaveBeenCalled();
    expect(result.successCount).toBe(0);
    expect(result.failedCount).toBe(1);
  });

  it("provider='hermes-with-gemini-fallback' does not call Gemini without GEMINI_API_KEY and keeps Hermes failure", async () => {
    const hermesError = new Error('Hermes timeout');
    const hermesAnalyze = vi.fn().mockRejectedValue(hermesError);
    const geminiAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const { service } = createService({
      configValues: {
        NEWS_ANALYSIS_PROVIDER: 'hermes-with-gemini-fallback',
        GEMINI_API_KEY: undefined,
      },
      hermesAnalyze,
      geminiAnalyze,
    });
    const warn = vi.spyOn((service as unknown as { logger: { warn: (message: string) => void } }).logger, 'warn');

    const result = await service.ingest('TEST');

    expect(hermesAnalyze).toHaveBeenCalledOnce();
    expect(geminiAnalyze).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Hermes timeout'));
    expect(result.successCount).toBe(0);
    expect(result.failedCount).toBe(1);
  });

  it("provider='gemini' uses Gemini only", async () => {
    const hermesAnalyze = vi.fn().mockRejectedValue(new Error('Hermes should not be called'));
    const geminiAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const { service, prisma } = createService({
      configValues: {
        NEWS_ANALYSIS_PROVIDER: 'gemini',
        GEMINI_API_KEY: 'test-key',
      },
      hermesAnalyze,
      geminiAnalyze,
    });

    const result = await service.ingest('TEST');

    expect(hermesAnalyze).not.toHaveBeenCalled();
    expect(geminiAnalyze).toHaveBeenCalledOnce();
    expect(prisma.newsAnalysis.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          provider: 'GEMINI',
          modelVersion: 'gemini-2.5-flash-lite',
        }),
      }),
    );
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(0);
  });

  it('returns a recent RUNNING run without starting duplicate collection', async () => {
    const hermesAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const geminiAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const { service, prisma, naverCollector } = createService({
      configValues: {
        NEWS_ANALYSIS_PROVIDER: 'hermes',
      },
      hermesAnalyze,
      geminiAnalyze,
    });
    const activeRun = {
      id: 'active-run',
      provider: 'AGGREGATED',
      status: 'RUNNING',
      targetDate: new Date('2026-06-18T01:00:00.000Z'),
      requestedBy: 'SCHEDULE',
      totalCount: 3,
      successCount: 1,
      failedCount: 0,
      errorMessage: null,
      startedAt: new Date(),
      finishedAt: null,
      createdAt: new Date(),
    };
    vi.mocked(prisma.newsAnalysisRun.findFirst).mockResolvedValue(activeRun);

    const result = await service.ingest('MANUAL');

    expect(result).toMatchObject({
      id: 'active-run',
      source: 'NAVER',
      status: 'RUNNING',
      totalCount: 3,
      successCount: 1,
    });
    expect(prisma.newsAnalysisRun.create).not.toHaveBeenCalled();
    expect(naverCollector.collect).not.toHaveBeenCalled();
    expect(hermesAnalyze).not.toHaveBeenCalled();
  });

  it('marks stale RUNNING runs failed before starting a new ingest', async () => {
    const hermesAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const geminiAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const { service, prisma } = createService({
      configValues: {
        NEWS_ANALYSIS_PROVIDER: 'hermes',
      },
      hermesAnalyze,
      geminiAnalyze,
    });

    await service.ingest('TEST');

    expect(prisma.newsAnalysisRun.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'RUNNING',
          OR: expect.arrayContaining([{ startedAt: null }]),
        }),
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: expect.stringContaining('exceeded 90 minutes'),
        }),
      }),
    );
    expect(prisma.newsAnalysisRun.create).toHaveBeenCalledOnce();
    expect(hermesAnalyze).toHaveBeenCalledOnce();
  });

  it('returns same-day SUCCEEDED run without starting new collection (idempotency)', async () => {
    const hermesAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const geminiAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const { service, prisma, naverCollector } = createService({
      configValues: {
        NEWS_ANALYSIS_PROVIDER: 'hermes',
      },
      hermesAnalyze,
      geminiAnalyze,
    });

    const completedRun = {
      id: 'completed-run',
      provider: 'AGGREGATED',
      status: 'SUCCEEDED',
      targetDate: new Date('2026-06-18T00:00:00.000Z'),
      requestedBy: 'SCHEDULE',
      totalCount: 10,
      successCount: 10,
      failedCount: 0,
      errorMessage: null,
      startedAt: new Date('2026-06-18T01:00:00.000Z'),
      finishedAt: new Date('2026-06-18T02:00:00.000Z'),
      createdAt: new Date(),
    };

    vi.mocked(prisma.newsAnalysisRun.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.newsAnalysisRun.findFirst).mockResolvedValueOnce(completedRun);

    const result = await service.ingest('SCHEDULE');

    expect(result).toMatchObject({
      id: 'completed-run',
      status: 'SUCCEEDED',
      totalCount: 10,
      successCount: 10,
    });
    expect(prisma.newsAnalysisRun.create).not.toHaveBeenCalled();
    expect(naverCollector.collect).not.toHaveBeenCalled();
    expect(hermesAnalyze).not.toHaveBeenCalled();
  });

  it('ignores same-day SUCCEEDED run if requestedBy is MANUAL (operator override)', async () => {
    const hermesAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const geminiAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const { service, prisma, naverCollector } = createService({
      configValues: {
        NEWS_ANALYSIS_PROVIDER: 'hermes',
      },
      hermesAnalyze,
      geminiAnalyze,
    });

    const completedRun = {
      id: 'completed-run',
      provider: 'AGGREGATED',
      status: 'SUCCEEDED',
      targetDate: new Date('2026-06-18T00:00:00.000Z'),
      requestedBy: 'SCHEDULE',
      totalCount: 10,
      successCount: 10,
      failedCount: 0,
      errorMessage: null,
      startedAt: new Date(),
      finishedAt: new Date(),
      createdAt: new Date(),
    };

    vi.mocked(prisma.newsAnalysisRun.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.newsAnalysisRun.findFirst).mockResolvedValueOnce(completedRun);

    const result = await service.ingest('MANUAL');

    expect(prisma.newsAnalysisRun.create).toHaveBeenCalledOnce();
    expect(naverCollector.collect).toHaveBeenCalledOnce();
    expect(hermesAnalyze).toHaveBeenCalledOnce();
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(0);
  });

  it('caps LLM analysis while saving and deterministically tagging remaining articles', async () => {
    const secondItem = {
      ...newsItem,
      title: '비트코인 신규 뉴스',
      url: 'https://news.example.com/btc-second',
      content: '비트코인 관련 신규 소식',
    };
    const hermesAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const geminiAnalyze = vi.fn().mockResolvedValue(analysisResult);
    const { service, prisma, naverCollector, alertService, logger } = createService({
      configValues: {
        NEWS_ANALYSIS_PROVIDER: 'hermes',
        NEWS_ANALYSIS_MAX_ARTICLES: '1',
      },
      hermesAnalyze,
      geminiAnalyze,
      items: [newsItem, secondItem],
    });
    vi.mocked(prisma.market.findMany).mockResolvedValue([
      { id: 'btc-id', symbol: 'BTC', koreanName: '비트코인' },
      { id: 'cyber-id', symbol: 'CYBER', koreanName: '사이버' },
      { id: 'short-id', symbol: 'ONE', koreanName: '원' },
    ] as never);
    vi.mocked(prisma.newsMarketTag.upsert).mockResolvedValue({
      market: { id: 'btc-id', code: 'KRW-BTC' },
    } as never);

    const result = await service.ingest('TEST');

    expect(naverCollector.collect).toHaveBeenCalledWith(['비트코인 코인']);
    expect(prisma.newsArticle.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.newsMarketTag.upsert).toHaveBeenCalledOnce();
    expect(hermesAnalyze).toHaveBeenCalledOnce();
    expect(prisma.newsAnalysis.upsert).toHaveBeenCalledOnce();
    expect(alertService.evaluateNewsSentiment).not.toHaveBeenCalled();
    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(logger.warn).toHaveBeenCalledWith(
      'LLM 분석 상한(1) 도달로 1건은 분석 없이 저장·태깅만 수행했습니다.',
    );
  });

  it('skips relatedMarkets tags without article evidence', async () => {
    const relatedMarketsAnalysis = { ...analysisResult, relatedMarkets: ['ETH'] };
    const hermesAnalyze = vi.fn().mockResolvedValue(relatedMarketsAnalysis);
    const geminiAnalyze = vi.fn().mockResolvedValue(relatedMarketsAnalysis);
    const { service, prisma, logger } = createService({
      configValues: { NEWS_ANALYSIS_PROVIDER: 'hermes' },
      hermesAnalyze,
      geminiAnalyze,
    });
    vi.mocked(prisma.market.findUnique).mockResolvedValue({
      id: 'eth-id',
      symbol: 'ETH',
      koreanName: '이더리움',
    } as never);

    await service.ingest('TEST');

    expect(prisma.newsMarketTag.upsert).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('근거 없는 LLM 마켓 태그 1건을 건너뛰었습니다.');
  });

  it('tags relatedMarkets with article evidence at confidence 0.8', async () => {
    const relatedMarketsAnalysis = { ...analysisResult, relatedMarkets: ['BTC'] };
    const hermesAnalyze = vi.fn().mockResolvedValue(relatedMarketsAnalysis);
    const geminiAnalyze = vi.fn().mockResolvedValue(relatedMarketsAnalysis);
    const { service, prisma } = createService({
      configValues: { NEWS_ANALYSIS_PROVIDER: 'hermes' },
      hermesAnalyze,
      geminiAnalyze,
    });
    vi.mocked(prisma.market.findUnique).mockResolvedValue({
      id: 'btc-id',
      symbol: 'BTC',
      koreanName: '비트코인',
    } as never);
    vi.mocked(prisma.newsMarketTag.upsert).mockResolvedValue({
      market: { id: 'btc-id', code: 'KRW-BTC' },
    } as never);

    await service.ingest('TEST');

    expect(prisma.newsMarketTag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { confidence: new PrismaDecimal(0.8) },
        create: expect.objectContaining({ confidence: new PrismaDecimal(0.8) }),
      }),
    );
  });
});
