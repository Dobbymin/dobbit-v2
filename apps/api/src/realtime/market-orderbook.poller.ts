import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MarketService } from '../market/market.service';
import { RealtimeService } from './realtime.service';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class MarketOrderbookPoller implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketOrderbookPoller.name);
  private intervalId: NodeJS.Timeout | null = null;
  private readonly pollingIntervalMs = 2000;

  constructor(
    private readonly marketService: MarketService,
    private readonly realtimeService: RealtimeService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  onModuleInit() {
    this.logger.log('Starting market orderbook poller...');
    this.intervalId = setInterval(() => {
      void this.poll();
    }, this.pollingIntervalMs);
  }

  onModuleDestroy() {
    this.logger.log('Stopping market orderbook poller...');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async poll(): Promise<void> {
    try {
      const activeMarkets = this.realtimeGateway.getActiveMarkets();

      if (activeMarkets.length === 0) {
        return;
      }

      const orderbookEvents = await this.marketService.getOrderbookEvents(activeMarkets);

      for (const event of orderbookEvents) {
        this.realtimeService.emitToMarket(event.marketCode, event);
      }
    } catch (error) {
      this.logger.warn('Error in market orderbook polling:', error);
      // Continue polling even on error
    }
  }
}
