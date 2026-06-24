import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { Market, CurrentPrice, CandleResponse, OrderbookResponse } from '@dobbit/shared';

interface CandleInterval {
  type: 'seconds' | 'minutes' | 'weeks' | 'months' | 'years';
  unit?: number;
}

type CandleType = CandleInterval['type'];

@Controller('api/market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('markets')
  async getMarkets(): Promise<Market[]> {
    return this.marketService.getMarkets();
  }

  @Get('markets/:code/price')
  async getCurrentPrice(@Param('code') code: string): Promise<CurrentPrice | null> {
    return this.marketService.getCurrentPrice(code);
  }

  @Get('markets/:code/orderbook')
  async getOrderbook(@Param('code') code: string): Promise<OrderbookResponse | null> {
    return this.marketService.getOrderbook(code);
  }

  @Get('markets/:code/candles')
  async getCandles(
    @Param('code') code: string,
    @Query('type') type: string = 'minutes',
    @Query('unit') unit: string = '1',
    @Query('count') count: string = '200',
  ): Promise<CandleResponse[]> {
    // 화이트리스트 검증
    const validTypes: CandleType[] = ['seconds', 'minutes', 'weeks', 'months', 'years'];
    const validMinutesUnits = [1, 5, 30, 60];

    const candleType: CandleType = validTypes.includes(type as CandleType) ? (type as CandleType) : 'minutes';
    let candleUnit = parseInt(unit, 10) || 1;

    if (candleType === 'minutes') {
      candleUnit = validMinutesUnits.includes(candleUnit) ? candleUnit : 1;
    }

    const candleCount = Math.min(parseInt(count, 10) || 200, 500);

    const interval: CandleInterval = { type: candleType, unit: candleUnit };
    return this.marketService.getCandles(code, interval, candleCount);
  }
}
