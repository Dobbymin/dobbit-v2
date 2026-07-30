import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Market, CurrentPrice, CandleResponse, MarketTickerUpdatedEvent, OrderbookResponse } from '@dobbit/shared';
import { UpbitApiClient } from './external/upbit-api.client';

interface CandleInterval {
  type: 'seconds' | 'minutes' | 'days' | 'weeks' | 'months' | 'years';
  unit?: number;
}

@Injectable()
export class MarketService implements OnModuleInit {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private readonly upbitApiClient: UpbitApiClient,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.syncMarkets().catch((error) => {
      this.logger.error('Failed to sync markets on module init:', error);
    });
  }

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
        signedChangePrice: ticker.signed_change_price,
        timestamp: new Date(ticker.trade_timestamp).toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get current price for ${code}:`, error);
      return null;
    }
  }

  async getCandles(
    code: string,
    interval: CandleInterval = { type: 'minutes', unit: 1 },
    count = 200,
  ): Promise<CandleResponse[]> {
    try {
      const candles = await this.upbitApiClient.getCandles(code, interval, count);

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
        signedChangePrice: t.signed_change_price,
        accTradeVolume24h: t.acc_trade_volume_24h,
        timestamp: new Date(t.trade_timestamp).toISOString(),
      }));
    } catch (error) {
      this.logger.error('Failed to get ticker events:', error);
      return [];
    }
  }

  async getOrderbook(code: string): Promise<OrderbookResponse | null> {
    try {
      const raw = (await this.upbitApiClient.getOrderbook(code)) as Array<{
        market: string;
        timestamp: number;
        orderbook_units: Array<{
          ask_price: number;
          bid_price: number;
          ask_size: number;
          bid_size: number;
        }>;
      }> | null;

      if (!raw || raw.length === 0) {
        return null;
      }

      const data = raw[0];
      return {
        marketCode: data.market,
        units: (data.orderbook_units ?? []).map((u) => ({
          askPrice: u.ask_price,
          bidPrice: u.bid_price,
          askSize: u.ask_size,
          bidSize: u.bid_size,
        })),
        timestamp: new Date(data.timestamp).toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get orderbook for ${code}:`, error);
      return null;
    }
  }

  async syncMarkets(): Promise<void> {
    try {
      const markets = await this.getMarkets();

      let syncedCount = 0;
      for (const market of markets) {
        await this.prisma.market.upsert({
          where: { code: market.code },
          update: {
            symbol: market.symbol,
            koreanName: market.koreanName,
            englishName: market.englishName,
            isActive: true,
          },
          create: {
            code: market.code,
            symbol: market.symbol,
            koreanName: market.koreanName,
            englishName: market.englishName,
            isActive: true,
          },
        });
        syncedCount++;
      }

      this.logger.log(`Successfully synced ${syncedCount} markets from Upbit`);
    } catch (error) {
      this.logger.error('Failed to sync markets:', error);
      throw error;
    }
  }

  syncMarketSnapshots(): Promise<void> {
    // TODO: Implement market snapshot sync
    // Periodically store current prices in database
    return Promise.resolve();
  }
}
