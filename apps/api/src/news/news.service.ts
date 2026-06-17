import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AlertService } from '../alert/alert.service';
import { NaverNewsCollector } from './collectors/naver-news.collector';
import { HermesAnalyzer } from './analyzers/hermes.analyzer';
import { GeminiAnalyzer } from './analyzers/gemini.analyzer';
import { AnalysisResult } from './analyzers/news-analyzer';
import { NewsAnalysisResponse, PredictionReviewResponse, NewsItem } from '@dobbit/shared';
import { Decimal as PrismaDecimal } from '@prisma/client/runtime/library';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly naverCollector: NaverNewsCollector,
    private readonly hermesAnalyzer: HermesAnalyzer,
    private readonly geminiAnalyzer: GeminiAnalyzer,
    private readonly alertService: AlertService,
  ) {}

  async ingest(requestedBy: string = 'SCHEDULE'): Promise<NewsIngestionRunResponse> {
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
          let modelVersion = 'hermes-agent';

          try {
            analysis = await this.hermesAnalyzer.analyze(item.content);
            provider = 'HERMES';
            modelVersion = 'hermes-agent';
          } catch {
            try {
              analysis = await this.geminiAnalyzer.analyze(item.content);
              provider = 'GEMINI';
              modelVersion = 'gemini-2.5-flash-lite';
            } catch (fallbackErr) {
              if (fallbackErr instanceof Error) {
                this.logger.warn(`분석 실패 (${item.url}): ${fallbackErr.message}`);
              } else {
                this.logger.warn(`분석 실패 (${item.url}): 알 수 없는 에러`);
              }
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

      const updatedRun = await this.prisma.newsAnalysisRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCEEDED',
          totalCount: items.length,
          successCount,
          failedCount,
          finishedAt: new Date(),
        },
      });

      return {
        id: updatedRun.id,
        source: 'NAVER',
        status: updatedRun.status,
        targetDate: updatedRun.targetDate,
        requestedBy: updatedRun.requestedBy,
        totalCount: updatedRun.totalCount,
        successCount: updatedRun.successCount,
        failedCount: updatedRun.failedCount,
        errorMessage: updatedRun.errorMessage,
        startedAt: updatedRun.startedAt,
        finishedAt: updatedRun.finishedAt,
      };
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

  getPredictionReview(limit = 10): Promise<PredictionReviewResponse[]> {
    void limit;
    return Promise.resolve<PredictionReviewResponse[]>([]);
  }

  collectNews(): Promise<void> {
    return Promise.resolve();
  }
}
