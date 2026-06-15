import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Market, CurrentPrice, CandleResponse, MarketTickerUpdatedEvent } from '@dobbit/shared';
import { UpbitApiClient } from './external/upbit-api.client';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private readonly upbitApiClient: UpbitApiClient,
    private readonly prisma: PrismaService,
  ) {}

  async getMarkets(): Promise<Market[]> {
    try {
      const upbitMarkets = await this.upbitApiClient.getMarkets();

      return upbitMarkets
        .filter((m) => m.market.startsWith('KRW-'))
        .map((m) => ({
          id: m.market,
          code: m.market,
          symbol: m.market.replace('KRW-', ''),
          koreanName: m.korean_name,
          englishName: m.english_name,
          isActive: true,
        }));
    } catch (error) {
      this.logger.error('Failed to get markets:', error);
      return [];
    }
  }

  async getCurrentPrice(code: string): Promise<CurrentPrice | null> {
    try {
      const tickers = await this.upbitApiClient.getTickers([code]);

      if (!tickers || tickers.length === 0) {
        return null;
      }

      const ticker = tickers[0];
      return {
        marketCode: ticker.market,
        tradePrice: ticker.trade_price,
        signedChangeRate: ticker.signed_change_rate,
        timestamp: new Date(ticker.trade_timestamp).toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get current price for ${code}:`, error);
      return null;
    }
  }

  async getCandles(code: string, unit = 1, count = 200): Promise<CandleResponse[]> {
    try {
      const candles = await this.upbitApiClient.getCandles(code, unit, count);

      if (!candles || candles.length === 0) {
        return [];
      }

      // Upbit returns candles in descending order (newest first), so reverse to get ascending
      return candles.reverse().map((c) => ({
        marketCode: c.market,
        openingPrice: c.opening_price,
        highPrice: c.high_price,
        lowPrice: c.low_price,
        tradePrice: c.trade_price,
        candleAccTradeVolume: c.candle_acc_trade_volume,
        candleDateTime: c.candle_date_time_kst || c.candle_date_time_utc,
      }));
    } catch (error) {
      this.logger.error(`Failed to get candles for ${code}:`, error);
      return [];
    }
  }

  async getTickerEvents(codes: string[]): Promise<MarketTickerUpdatedEvent[]> {
    try {
      const tickers = await this.upbitApiClient.getTickers(codes);

      if (!tickers || tickers.length === 0) {
        return [];
      }

      return tickers.map((t) => ({
        type: 'market.ticker.updated' as const,
        marketCode: t.market,
        tradePrice: t.trade_price,
        signedChangeRate: t.signed_change_rate,
        accTradeVolume24h: t.acc_trade_volume_24h,
        timestamp: new Date(t.trade_timestamp).toISOString(),
      }));
    } catch (error) {
      this.logger.error('Failed to get ticker events:', error);
      return [];
    }
  }

  syncMarkets(): Promise<void> {
    // TODO: Implement market sync from Upbit
    // Fetch all markets and update database
    return Promise.resolve();
  }

  syncMarketSnapshots(): Promise<void> {
    // TODO: Implement market snapshot sync
    // Periodically store current prices in database
    return Promise.resolve();
  }
}
