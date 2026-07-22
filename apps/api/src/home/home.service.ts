import { Injectable, Logger } from '@nestjs/common';
import { HomeHighlight, HomeNewsItem, HomeRankingItem, HomeSummaryResponse } from '@dobbit/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpbitApiClient } from '../market/external/upbit-api.client';

const HIGHLIGHT_CODES = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-SOL'];
const RANKING_LIMIT = 20;
const CACHE_TTL_MS = 60_000;

type Ticker = {
  market: string;
  trade_price: number;
  signed_change_rate: number;
  acc_trade_price_24h: number;
  acc_trade_volume_24h: number;
};

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);
  private cache: { value: HomeSummaryResponse; expiresAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly upbitApiClient: UpbitApiClient,
  ) {}

  async getSummary(): Promise<HomeSummaryResponse> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.value;
    }

    const [marketData, news] = await Promise.all([this.getMarketData(), this.getNews()]);
    const summary = { ...marketData, news };
    this.cache = { value: summary, expiresAt: Date.now() + CACHE_TTL_MS };
    return summary;
  }

  private async getMarketData(): Promise<Pick<HomeSummaryResponse, 'highlights' | 'rankings'>> {
    try {
      const [tickers, markets] = await Promise.all([
        this.upbitApiClient.getAllKrwTickers(),
        this.prisma.market.findMany({ select: { id: true, code: true, koreanName: true } }),
      ]);
      const tickerByCode = new Map(tickers.map((ticker) => [ticker.market, ticker]));
      const marketByCode = new Map(markets.map((market) => [market.code, market]));

      return {
        highlights: await this.getHighlights(tickerByCode, marketByCode),
        rankings: await this.getRankings(tickers, marketByCode, markets),
      };
    } catch (error) {
      this.logger.error('Failed to get home market data:', error);
      return this.emptyMarketData();
    }
  }

  private async getHighlights(
    tickerByCode: Map<string, Ticker>,
    marketByCode: Map<string, { id: string; code: string; koreanName: string }>,
  ): Promise<HomeHighlight[]> {
    if (HIGHLIGHT_CODES.some((code) => !tickerByCode.has(code) || !marketByCode.has(code))) {
      return [];
    }

    try {
      const candlesByMarket = await Promise.all(
        HIGHLIGHT_CODES.map((code) => this.upbitApiClient.getCandles(code, { type: 'minutes', unit: 60 }, 24)),
      );

      return HIGHLIGHT_CODES.map((marketCode, index) => {
        const ticker = tickerByCode.get(marketCode)!;
        const market = marketByCode.get(marketCode)!;
        return {
          marketCode,
          koreanName: market.koreanName,
          tradePrice: ticker.trade_price,
          signedChangeRate: ticker.signed_change_rate,
          sparkline: candlesByMarket[index].reverse().map((candle) => candle.trade_price),
        };
      });
    } catch (error) {
      this.logger.error('Failed to get home highlights:', error);
      return [];
    }
  }

  private async getRankings(
    tickers: Ticker[],
    marketByCode: Map<string, { id: string; code: string; koreanName: string }>,
    markets: Array<{ id: string; code: string; koreanName: string }>,
  ): Promise<HomeSummaryResponse['rankings']> {
    const makeRanking = (items: Ticker[]): HomeRankingItem[] =>
      items
        .filter((ticker) => marketByCode.has(ticker.market))
        .slice(0, RANKING_LIMIT)
        .map((ticker, index) => ({
          rank: index + 1,
          marketCode: ticker.market,
          koreanName: marketByCode.get(ticker.market)!.koreanName,
          tradePrice: ticker.trade_price,
          signedChangeRate: ticker.signed_change_rate,
          accTradePrice24h: ticker.acc_trade_price_24h,
          accTradeVolume24h: ticker.acc_trade_volume_24h,
        }));

    const tradePrice = makeRanking([...tickers].sort((a, b) => b.acc_trade_price_24h - a.acc_trade_price_24h));
    const rankings = {
      tradePrice,
      surge: makeRanking([...tickers].sort((a, b) => b.signed_change_rate - a.signed_change_rate)),
      plunge: makeRanking([...tickers].sort((a, b) => a.signed_change_rate - b.signed_change_rate)),
      volume: makeRanking([...tickers].sort((a, b) => b.acc_trade_volume_24h - a.acc_trade_volume_24h)),
      popular: [] as HomeRankingItem[],
    };

    try {
      const [favorites, trades] = await Promise.all([
        this.prisma.favorite.groupBy({ by: ['marketCode'], _count: { _all: true } }),
        this.prisma.trade.groupBy({ by: ['marketId'], _count: { _all: true } }),
      ]);
      const popularityByCode = new Map<string, number>();
      for (const favorite of favorites) {
        popularityByCode.set(favorite.marketCode, favorite._count._all);
      }
      const codeByMarketId = new Map(markets.map((market) => [market.id, market.code]));
      for (const trade of trades) {
        const code = codeByMarketId.get(trade.marketId);
        if (code) {
          popularityByCode.set(code, (popularityByCode.get(code) ?? 0) + trade._count._all);
        }
      }

      if (popularityByCode.size === 0) {
        rankings.popular = tradePrice;
      } else {
        const tickerByCode = new Map(tickers.map((ticker) => [ticker.market, ticker]));
        rankings.popular = [...popularityByCode.entries()]
          .sort(([, left], [, right]) => right - left)
          .map(([code]) => tickerByCode.get(code))
          .filter((ticker): ticker is Ticker => Boolean(ticker))
          .slice(0, RANKING_LIMIT)
          .map((ticker, index) => ({
            rank: index + 1,
            marketCode: ticker.market,
            koreanName: marketByCode.get(ticker.market)?.koreanName ?? ticker.market,
            tradePrice: ticker.trade_price,
            signedChangeRate: ticker.signed_change_rate,
            accTradePrice24h: ticker.acc_trade_price_24h,
            accTradeVolume24h: ticker.acc_trade_volume_24h,
          }));
      }
    } catch (error) {
      this.logger.error('Failed to get popular rankings:', error);
      rankings.popular = tradePrice;
    }

    return rankings;
  }

  private async getNews(): Promise<HomeNewsItem[]> {
    try {
      const articles = await this.prisma.newsArticle.findMany({
        take: 5,
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
      return articles.map((article) => ({
        id: article.id,
        title: article.title,
        url: article.url,
        publisher: article.publisher,
        publishedAt: article.publishedAt.toISOString(),
        sentiment: this.toSentiment(article.analyses[0]?.sentiment),
      }));
    } catch (error) {
      this.logger.error('Failed to get home news:', error);
      return [];
    }
  }

  private toSentiment(sentiment: string | undefined): HomeNewsItem['sentiment'] {
    return sentiment === 'POSITIVE' || sentiment === 'NEUTRAL' || sentiment === 'NEGATIVE' ? sentiment : null;
  }

  private emptyMarketData(): Pick<HomeSummaryResponse, 'highlights' | 'rankings'> {
    return {
      highlights: [],
      rankings: { tradePrice: [], surge: [], plunge: [], volume: [], popular: [] },
    };
  }
}
