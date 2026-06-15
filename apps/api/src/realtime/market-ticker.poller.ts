import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MarketService } from '../market/market.service';
import { RealtimeService } from './realtime.service';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class MarketTickerPoller implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketTickerPoller.name);
  private intervalId: NodeJS.Timeout | null = null;
  private readonly pollingIntervalMs = 2000;

  constructor(
    private readonly marketService: MarketService,
    private readonly realtimeService: RealtimeService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  onModuleInit() {
    this.logger.log('Starting market ticker poller...');
    this.intervalId = setInterval(() => {
      void this.poll();
    }, this.pollingIntervalMs);
  }

  onModuleDestroy() {
    this.logger.log('Stopping market ticker poller...');
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

      const tickerEvents = await this.marketService.getTickerEvents(activeMarkets);

      for (const event of tickerEvents) {
        this.realtimeService.emitToMarket(event.marketCode, event);
      }
    } catch (error) {
      this.logger.warn('Error in market ticker polling:', error);
      // Continue polling even on error
    }
  }
}
