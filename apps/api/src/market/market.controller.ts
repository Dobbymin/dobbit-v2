import { Controller, Get, Param } from '@nestjs/common';
import { MarketService } from './market.service';
import { Market, CurrentPrice } from '@dobbit/shared';

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
}
