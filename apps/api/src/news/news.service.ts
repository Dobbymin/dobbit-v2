import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { AlertService } from '../alert/alert.service';
import { NaverNewsCollector } from './collectors/naver-news.collector';
import { HermesAnalyzer } from './analyzers/hermes.analyzer';
import { GeminiAnalyzer } from './analyzers/gemini.analyzer';
import { AnalysisResult, DEFAULT_HERMES_MODEL } from './analyzers/news-analyzer';
import { NewsAnalysisResponse, PredictionDirection, PredictionReviewResponse, NewsItem } from '@dobbit/shared';
import { Decimal as PrismaDecimal } from '@prisma/client/runtime/library';
import { UpbitApiClient } from '../market/external/upbit-api.client';

const REVIEW_TIME_HORIZON = '1D';
const REVIEW_TIME_HORIZON_MS = 24 * 60 * 60 * 1000;
const ACTIVE_INGEST_MAX_AGE_MS = 90 * 60 * 1000;
const PREDICTED_DIRECTION_DEAD_BAND = { UP: 0.15, DOWN: -0.15 } as const;
const ACTUAL_DIRECTION_DEAD_BAND = { UP: 0.005, DOWN: -0.005 } as const;
type NewsAnalysisProvider = 'hermes' | 'hermes-with-gemini-fallback' | 'gemini';

interface NewsIngestionRunResponse {
  id: string;
  source: string;
  status: string;
  targetDate: Date;
  requestedBy: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  errorMessage: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly newsAnalysisProvider: NewsAnalysisProvider;
  private readonly hermesModel: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly naverCollector: NaverNewsCollector,
    private readonly hermesAnalyzer: HermesAnalyzer,
    private readonly geminiAnalyzer: GeminiAnalyzer,
    private readonly alertService: AlertService,
    private readonly upbitApiClient: UpbitApiClient,
    private readonly config: ConfigService,
  ) {
    const newsAnalysisProvider = this.config.get<string>('NEWS_ANALYSIS_PROVIDER', 'hermes');
    this.newsAnalysisProvider = this.isNewsAnalysisProvider(newsAnalysisProvider) ? newsAnalysisProvider : 'hermes';
    this.hermesModel = this.config.get<string>('HERMES_MODEL', DEFAULT_HERMES_MODEL);
  }

  async ingest(requestedBy: string = 'SCHEDULE'): Promise<NewsIngestionRunResponse> {
    const activeStartedAfter = new Date(Date.now() - ACTIVE_INGEST_MAX_AGE_MS);
    const activeRun = await this.prisma.newsAnalysisRun.findFirst({
      where: {
        status: 'RUNNING',
        startedAt: { gte: activeStartedAfter },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (activeRun) {
      this.logger.warn(`뉴스 수집 중복 요청 skip: active run=${activeRun.id}`);
      return this.toIngestionRunResponse(activeRun);
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const completedRun = await this.prisma.newsAnalysisRun.findFirst({
      where: {
        status: { in: ['SUCCEEDED', 'PARTIAL_SUCCESS'] },
        targetDate: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
      orderBy: { targetDate: 'desc' },
    });
    if (completedRun && requestedBy !== 'MANUAL') {
      this.logger.warn(`뉴스 수집 멱등성 skip: completed run=${completedRun.id}`);
      return this.toIngestionRunResponse(completedRun);
    }

    await this.prisma.newsAnalysisRun.updateMany({
      where: {
        status: 'RUNNING',
        OR: [{ startedAt: null }, { startedAt: { lt: activeStartedAfter } }],
      },
      data: {
        status: 'FAILED',
        errorMessage:
          'Stale RUNNING news ingest run exceeded 90 minutes and was marked failed before a new ingest started.',
        finishedAt: new Date(),
      },
    });

    const run = await this.prisma.newsAnalysisRun.create({
      data: {
        provider: 'AGGREGATED',
        status: 'RUNNING',
        targetDate: new Date(),
        requestedBy,
        totalCount: 0,
        successCount: 0,
        failedCount: 0,
        startedAt: new Date(),
      },
    });

    try {
      const items = await this.naverCollector.collect();
      let successCount = 0;
      let failedCount = 0;

      for (const item of items) {
        try {
          const article = await this.prisma.newsArticle.upsert({
            where: { url: item.url },
            update: { collectedAt: new Date() },
            create: {
              source: item.source,
              title: item.title,
              url: item.url,
              publisher: null,
              publishedAt: item.publishedAt,
              content: item.content,
              summary: item.content.substring(0, 500),
              collectedAt: new Date(),
            },
          });

          let analysis: AnalysisResult | null = null;
          let provider: 'HERMES' | 'GEMINI' = 'HERMES';
          let modelVersion = this.hermesModel;
          const primaryAnalyzer = this.selectAnalyzer();

          try {
            analysis = await primaryAnalyzer.analyze(item.content);
            if (primaryAnalyzer === this.geminiAnalyzer) {
              provider = 'GEMINI';
              modelVersion = 'gemini-2.5-flash-lite';
            } else {
              provider = 'HERMES';
              modelVersion = this.hermesModel;
            }
          } catch (primaryErr) {
            if (this.newsAnalysisProvider !== 'hermes-with-gemini-fallback') {
              this.logAnalysisFailure(item.url, primaryErr);
              failedCount++;
              continue;
            }

            const geminiApiKey = this.config.get<string>('GEMINI_API_KEY', '');
            if (!geminiApiKey) {
              this.logAnalysisFailure(item.url, primaryErr);
              failedCount++;
              continue;
            }

            try {
              analysis = await this.geminiAnalyzer.analyze(item.content);
              provider = 'GEMINI';
              modelVersion = 'gemini-2.5-flash-lite';
            } catch (fallbackErr) {
              this.logAnalysisFailure(item.url, fallbackErr);
              failedCount++;
              continue;
            }
          }

          if (!analysis) {
            failedCount++;
            continue;
          }

          const taggedMarkets: Array<{ id: string; code: string }> = [];

          if (analysis.relatedMarkets && analysis.relatedMarkets.length > 0) {
            for (const symbol of analysis.relatedMarkets) {
              const market = await this.prisma.market.findUnique({
                where: { symbol },
              });
              if (market) {
                const tag = await this.prisma.newsMarketTag.upsert({
                  where: {
                    newsArticleId_marketId: {
                      newsArticleId: article.id,
                      marketId: market.id,
                    },
                  },
                  update: { confidence: new PrismaDecimal(0.8) },
                  create: {
                    newsArticleId: article.id,
                    marketId: market.id,
                    symbol,
                    confidence: new PrismaDecimal(0.8),
                  },
                  include: { market: true },
                });
                if (!taggedMarkets.some((taggedMarket) => taggedMarket.id === tag.market.id)) {
                  taggedMarkets.push({ id: tag.market.id, code: tag.market.code });
                }
              }
            }
          }

          const sentimentMap: Record<string, 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> = {
            positive: 'POSITIVE',
            neutral: 'NEUTRAL',
            negative: 'NEGATIVE',
          };

          const newsAnalysis = await this.prisma.newsAnalysis.upsert({
            where: {
              newsArticleId_provider_modelVersion: {
                newsArticleId: article.id,
                provider,
                modelVersion,
              },
            },
            update: { analyzedAt: new Date() },
            create: {
              newsArticleId: article.id,
              provider,
              sentiment: sentimentMap[analysis.sentiment],
              confidence: new PrismaDecimal(analysis.confidence),
              investmentScore: new PrismaDecimal(analysis.investmentScore),
              keywords: analysis.keywords,
              reason: analysis.reason,
              modelVersion,
              analyzedAt: new Date(),
            },
          });

          for (const market of taggedMarkets) {
            try {
              await this.alertService.evaluateNewsSentiment({
                marketId: market.id,
                marketCode: market.code,
                investmentScore: Number(newsAnalysis.investmentScore),
                sentiment: newsAnalysis.sentiment as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
                articleTitle: article.title,
                newsAnalysisId: newsAnalysis.id,
              });
            } catch (alertErr) {
              const message = alertErr instanceof Error ? alertErr.message : '알 수 없는 에러';
              this.logger.warn(`뉴스 감성 알림 평가 실패 (${market.code}): ${message}`);
            }
          }

          successCount++;
        } catch (itemErr) {
          if (itemErr instanceof Error) {
            this.logger.error(`기사 처리 실패 (${item.url}): ${itemErr.message}`);
          } else {
            this.logger.error(`기사 처리 실패 (${item.url}): 알 수 없는 에러`);
          }
          failedCount++;
        }
      }

      const totalCount = items.length;
      const status =
        totalCount === 0 || (successCount > 0 && failedCount === 0)
          ? 'SUCCEEDED'
          : successCount > 0 && failedCount > 0
            ? 'PARTIAL_SUCCESS'
            : 'FAILED';

      const updatedRun = await this.prisma.newsAnalysisRun.update({
        where: { id: run.id },
        data: {
          status,
          totalCount,
          successCount,
          failedCount,
          finishedAt: new Date(),
        },
      });

      return this.toIngestionRunResponse(updatedRun);
    } catch (error) {
      if (error instanceof Error) {
        await this.prisma.newsAnalysisRun.update({
          where: { id: run.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
            finishedAt: new Date(),
          },
        });
      } else {
        await this.prisma.newsAnalysisRun.update({
          where: { id: run.id },
          data: {
            status: 'FAILED',
            errorMessage: '알 수 없는 에러',
            finishedAt: new Date(),
          },
        });
      }
      throw error;
    }
  }

  async getArticles(limit = 20, offset = 0): Promise<NewsItem[]> {
    const articles = await this.prisma.newsArticle.findMany({
      take: limit,
      skip: offset,
      orderBy: { publishedAt: 'desc' },
      include: {
        analyses: {
          orderBy: { analyzedAt: 'desc' },
          take: 1,
        },
      },
    });

    return articles.map((article) => {
      const latestAnalysis = article.analyses[0];

      const sentiment = latestAnalysis?.sentiment;
      const provider = latestAnalysis?.provider;

      return {
        id: article.id,
        title: article.title,
        url: article.url,
        source: article.source,
        publisher: article.publisher,
        publishedAt: article.publishedAt.toISOString(),
        summary: article.summary,
        content: article.content,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sentiment: (sentiment as any) || null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        provider: (provider as any) || null,
        confidence: latestAnalysis?.confidence ? Number(latestAnalysis.confidence) : null,
        investmentScore: latestAnalysis?.investmentScore ? Number(latestAnalysis.investmentScore) : null,
        reason: latestAnalysis?.reason || null,
        keywords: latestAnalysis?.keywords || null,
      };
    });
  }

  runAnalysis(articleId: string): Promise<NewsAnalysisResponse> {
    void articleId;
    return Promise.resolve({} as NewsAnalysisResponse);
  }

  async reviewPredictions(): Promise<{ reviewedCount: number; skippedCount: number }> {
    const now = new Date();
    const reviewablePublishedAt = new Date(now.getTime() - REVIEW_TIME_HORIZON_MS);

    const analyses = await this.prisma.newsAnalysis.findMany({
      where: {
        predictionReview: null,
        newsArticle: {
          publishedAt: { lte: reviewablePublishedAt },
          marketTags: { some: {} },
        },
      },
      include: {
        newsArticle: {
          include: {
            marketTags: {
              include: { market: true },
            },
          },
        },
      },
      orderBy: { analyzedAt: 'asc' },
    });

    let reviewedCount = 0;
    let skippedCount = 0;

    for (const analysis of analyses) {
      try {
        const marketTag = analysis.newsArticle.marketTags.reduce<
          (typeof analysis.newsArticle.marketTags)[number] | null
        >((selected, tag) => {
          if (!selected) {
            return tag;
          }

          return Number(tag.confidence) > Number(selected.confidence) ? tag : selected;
        }, null);

        if (!marketTag) {
          this.logger.warn(`예측 리뷰 skip: 마켓 태그 없음 (newsAnalysisId=${analysis.id})`);
          skippedCount++;
          continue;
        }

        const publishedAt = analysis.newsArticle.publishedAt;
        const reviewTargetAt = new Date(publishedAt.getTime() + REVIEW_TIME_HORIZON_MS);
        const predictedDirection = this.getPredictedDirection(Number(analysis.investmentScore));
        const basePrice = await this.getCandleTradePrice(
          marketTag.market.code,
          publishedAt.toISOString(),
          analysis.id,
          'base',
        );
        const futurePrice = await this.getCandleTradePrice(
          marketTag.market.code,
          reviewTargetAt.toISOString(),
          analysis.id,
          'future',
        );

        if (basePrice === null || futurePrice === null) {
          skippedCount++;
          continue;
        }

        const actualReturn = (futurePrice - basePrice) / basePrice;
        const actualDirection = this.getActualDirection(actualReturn);
        const errorRate = Math.min(Math.abs(actualReturn), 0.9999);

        await this.prisma.predictionReview.create({
          data: {
            newsAnalysisId: analysis.id,
            marketId: marketTag.marketId,
            basePrice: new PrismaDecimal(basePrice),
            futurePrice: new PrismaDecimal(futurePrice),
            timeHorizon: REVIEW_TIME_HORIZON,
            predictedDirection,
            actualDirection,
            isMatched: predictedDirection === actualDirection,
            errorRate: new PrismaDecimal(errorRate.toFixed(4)),
            reviewedAt: new Date(),
          },
        });

        reviewedCount++;
      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 에러';
        this.logger.warn(`예측 리뷰 skip: 처리 실패 (newsAnalysisId=${analysis.id}): ${message}`);
        skippedCount++;
      }
    }

    return { reviewedCount, skippedCount };
  }

  async getPredictionReview(limit = 50): Promise<PredictionReviewResponse[]> {
    const reviews = await this.prisma.predictionReview.findMany({
      take: limit,
      orderBy: { reviewedAt: 'desc' },
      include: {
        market: true,
        newsAnalysis: true,
      },
    });

    return reviews.map((review) => ({
      id: review.id,
      newsAnalysisId: review.newsAnalysisId,
      marketCode: review.market.code,
      provider: review.newsAnalysis.provider as PredictionReviewResponse['provider'],
      predictedDirection: review.predictedDirection as PredictionDirection,
      actualDirection: review.actualDirection as PredictionDirection,
      isMatched: review.isMatched,
      errorRate: Number(review.errorRate),
      reviewedAt: review.reviewedAt.toISOString(),
    }));
  }

  collectNews(): Promise<void> {
    return Promise.resolve();
  }

  private toIngestionRunResponse(run: Omit<NewsIngestionRunResponse, 'source'>): NewsIngestionRunResponse {
    return {
      id: run.id,
      source: 'NAVER',
      status: run.status,
      targetDate: run.targetDate,
      requestedBy: run.requestedBy,
      totalCount: run.totalCount,
      successCount: run.successCount,
      failedCount: run.failedCount,
      errorMessage: run.errorMessage,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
    };
  }

  private isNewsAnalysisProvider(value: string): value is NewsAnalysisProvider {
    return value === 'hermes' || value === 'hermes-with-gemini-fallback' || value === 'gemini';
  }

  private selectAnalyzer(): HermesAnalyzer | GeminiAnalyzer {
    if (this.newsAnalysisProvider === 'gemini') {
      return this.geminiAnalyzer;
    }

    return this.hermesAnalyzer;
  }

  private logAnalysisFailure(url: string, error: unknown): void {
    if (error instanceof Error) {
      this.logger.warn(`분석 실패 (${url}): ${error.message}`);
      return;
    }

    this.logger.warn(`분석 실패 (${url}): 알 수 없는 에러`);
  }

  private getPredictedDirection(investmentScore: number): PredictionDirection {
    if (investmentScore >= PREDICTED_DIRECTION_DEAD_BAND.UP) {
      return 'UP';
    }

    if (investmentScore <= PREDICTED_DIRECTION_DEAD_BAND.DOWN) {
      return 'DOWN';
    }

    return 'FLAT';
  }

  private getActualDirection(actualReturn: number): PredictionDirection {
    if (actualReturn >= ACTUAL_DIRECTION_DEAD_BAND.UP) {
      return 'UP';
    }

    if (actualReturn <= ACTUAL_DIRECTION_DEAD_BAND.DOWN) {
      return 'DOWN';
    }

    return 'FLAT';
  }

  private async getCandleTradePrice(
    marketCode: string,
    to: string,
    newsAnalysisId: string,
    priceLabel: 'base' | 'future',
  ): Promise<number | null> {
    try {
      const candles = await this.upbitApiClient.getCandles(marketCode, { type: 'days' }, 1, to);
      const tradePrice = candles[0]?.trade_price;

      if (!Number.isFinite(tradePrice) || tradePrice <= 0) {
        this.logger.warn(
          `예측 리뷰 skip: 유효하지 않은 ${priceLabel} 가격 (newsAnalysisId=${newsAnalysisId}, market=${marketCode}, to=${to})`,
        );
        return null;
      }

      return tradePrice;
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 에러';
      this.logger.warn(
        `예측 리뷰 skip: ${priceLabel} 캔들 조회 실패 (newsAnalysisId=${newsAnalysisId}, market=${marketCode}, to=${to}): ${message}`,
      );
      return null;
    }
  }
}
