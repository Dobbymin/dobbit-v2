import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { Market, CurrentPrice, CandleResponse } from '@dobbit/shared';

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

  @Get('markets/:code/candles')
  async getCandles(
    @Param('code') code: string,
    @Query('unit') unit: string = '1',
    @Query('count') count: string = '200',
  ): Promise<CandleResponse[]> {
    return this.marketService.getCandles(code, parseInt(unit, 10), parseInt(count, 10));
  }
}
