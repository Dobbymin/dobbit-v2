import { Injectable, Logger } from '@nestjs/common';
import { HomeHighlight, HomeNewsItem, HomeRankingItem, HomeSummaryResponse } from '@dobbit/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpbitApiClient } from '../market/external/upbit-api.client';

const HIGHLIGHT_CODES = ['KRW-BTC', 'KRW-ETH'];
const RANKING_LIMIT = 20;
const CACHE_TTL_MS = 60_000;

type Ticker = {
  market: string;
  trade_price: number;
  signed_change_rate: number;
  acc_trade_price_24h: number;
  acc_trade_volume_24h: number;
};

type MarketDataResult = {
  data: Pick<HomeSummaryResponse, 'highlights' | 'rankings'>;
  success: boolean;
};

type NewsResult = {
  data: HomeNewsItem[];
  success: boolean;
};

type HighlightsResult = {
  data: HomeHighlight[];
  success: boolean;
};

type RankingsResult = {
  data: HomeSummaryResponse['rankings'];
  success: boolean;
};

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);
  private cache: { value: HomeSummaryResponse; expiresAt: number } | null = null;
  private inFlightSummary: Promise<HomeSummaryResponse> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly upbitApiClient: UpbitApiClient,
  ) {}

  async getSummary(): Promise<HomeSummaryResponse> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.value;
    }

    if (this.inFlightSummary !== null) {
      return this.inFlightSummary;
    }

    const request = this.createSummary();
    this.inFlightSummary = request;

    try {
      return await request;
    } finally {
      if (this.inFlightSummary === request) {
        this.inFlightSummary = null;
      }
    }
  }

  private async createSummary(): Promise<HomeSummaryResponse> {
    const [marketData, news] = await Promise.all([this.getMarketData(), this.getNews()]);
    const summary = { ...marketData.data, news: news.data };

    if (marketData.success && news.success) {
      this.cache = { value: summary, expiresAt: Date.now() + CACHE_TTL_MS };
    }

    return summary;
  }

  private async getMarketData(): Promise<MarketDataResult> {
    try {
      const [tickers, markets] = await Promise.all([
        this.upbitApiClient.getAllKrwTickers(),
        this.prisma.market.findMany({ select: { code: true, koreanName: true } }),
      ]);
      const tickerByCode = new Map(tickers.map((ticker) => [ticker.market, ticker]));
      const marketByCode = new Map(markets.map((market) => [market.code, market]));
      const [highlights, rankings] = await Promise.all([
        this.getHighlights(tickerByCode, marketByCode),
        this.getRankings(tickers, marketByCode),
      ]);

      return {
        data: {
          highlights: highlights.data,
          rankings: rankings.data,
        },
        success: highlights.success && rankings.success,
      };
    } catch (error) {
      this.logger.error('Failed to get home market data:', error);
      return { data: this.emptyMarketData(), success: false };
    }
  }

  private async getHighlights(
    tickerByCode: Map<string, Ticker>,
    marketByCode: Map<string, { code: string; koreanName: string }>,
  ): Promise<HighlightsResult> {
    const availableCodes = HIGHLIGHT_CODES.filter((code) => tickerByCode.has(code) && marketByCode.has(code));
    if (availableCodes.length === 0) {
      return { data: [], success: true };
    }

    try {
      const candlesByMarket = await Promise.all(
        availableCodes.map((code) => this.upbitApiClient.getCandles(code, { type: 'minutes', unit: 10 }, 144)),
      );

      return {
        data: availableCodes
          .map((marketCode, index) => {
            const ticker = tickerByCode.get(marketCode);
            const market = marketByCode.get(marketCode);
            const candles = candlesByMarket[index];
            if (candles.length === 0) {
              return null;
            }

            const high24h = Math.max(...candles.map((candle) => candle.high_price));
            const low24h = Math.min(...candles.map((candle) => candle.low_price));

            return {
              marketCode,
              koreanName: market.koreanName,
              tradePrice: ticker.trade_price,
              signedChangeRate: ticker.signed_change_rate,
              high24h,
              low24h,
              sparkline: [...candles].reverse().map((candle) => candle.trade_price),
            };
          })
          .filter((item): item is HomeHighlight => item !== null),
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to get home highlights:', error);
      return { data: [], success: false };
    }
  }

  private async getRankings(
    tickers: Ticker[],
    marketByCode: Map<string, { code: string; koreanName: string }>,
  ): Promise<RankingsResult> {
    const makeRanking = (items: Ticker[]): HomeRankingItem[] =>
      items
        .filter((ticker) => marketByCode.has(ticker.market))
        .slice(0, RANKING_LIMIT)
        .map((ticker, index) => ({
          rank: index + 1,
          marketCode: ticker.market,
          koreanName: marketByCode.get(ticker.market).koreanName,
          tradePrice: ticker.trade_price,
          signedChangeRate: ticker.signed_change_rate,
          accTradePrice24h: ticker.acc_trade_price_24h,
          accTradeVolume24h: ticker.acc_trade_volume_24h,
        }));

    return {
      data: {
        tradePrice: makeRanking([...tickers].sort((a, b) => b.acc_trade_price_24h - a.acc_trade_price_24h)),
        surge: makeRanking([...tickers].sort((a, b) => b.signed_change_rate - a.signed_change_rate)),
        plunge: makeRanking([...tickers].sort((a, b) => a.signed_change_rate - b.signed_change_rate)),
        volume: makeRanking([...tickers].sort((a, b) => b.acc_trade_volume_24h - a.acc_trade_volume_24h)),
      },
      success: true,
    };
  }

  private async getNews(): Promise<NewsResult> {
    try {
      const articles = await this.prisma.newsArticle.findMany({
        take: 7,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          url: true,
          publisher: true,
          publishedAt: true,
          analyses: { take: 1, orderBy: { analyzedAt: 'desc' }, select: { sentiment: true } },
        },
      });
      return {
        data: articles.map((article) => ({
          id: article.id,
          title: article.title,
          url: article.url,
          publisher: article.publisher,
          publishedAt: article.publishedAt.toISOString(),
          sentiment: this.toSentiment(article.analyses[0]?.sentiment),
        })),
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to get home news:', error);
      return { data: [], success: false };
    }
  }

  private toSentiment(sentiment: string | undefined): HomeNewsItem['sentiment'] {
    return sentiment === 'POSITIVE' || sentiment === 'NEUTRAL' || sentiment === 'NEGATIVE' ? sentiment : null;
  }

  private emptyMarketData(): Pick<HomeSummaryResponse, 'highlights' | 'rankings'> {
    return {
      highlights: [],
      rankings: { tradePrice: [], surge: [], plunge: [], volume: [] },
    };
  }
}
