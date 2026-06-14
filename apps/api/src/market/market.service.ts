import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../common/prisma/prisma.service';
import { Market, CurrentPrice } from '@dobbit/shared';

@Injectable()
export class MarketService {
  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  getMarkets(): Promise<Market[]> {
    // TODO: Implement market list fetching from Upbit or cache
    return Promise.resolve<Market[]>([]);
  }

  getCurrentPrice(marketCode: string): Promise<CurrentPrice | null> {
    void marketCode;
    // TODO: Implement current price fetching from Upbit API
    // Upbit API: https://docs.upbit.com/reference/candle-minute1
    return Promise.resolve(null);
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
