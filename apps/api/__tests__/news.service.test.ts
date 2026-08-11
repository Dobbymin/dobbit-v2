import type { ConfigService } from '@nestjs/config';
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
}: {
  configValues: Record<string, string | undefined>;
  hermesAnalyze: ReturnType<typeof vi.fn>;
  geminiAnalyze: ReturnType<typeof vi.fn>;
}) => {
  const prisma = createPrisma();
  const naverCollector = {
    collect: vi.fn().mockResolvedValue([newsItem]),
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

  vi.spyOn(service as unknown as { logger: { warn: (message: string) => void } }, 'logger', 'get').mockReturnValue({
    warn: vi.fn(),
    error: vi.fn(),
  } as never);

  return { service, prisma, naverCollector };
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
});
