import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { TradeService } from './trade.service';
import type { TradeResponse } from '@dobbit/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface BuyRequest {
  marketCode: string;
  quantity: number;
  price: number;
}

interface SellRequest {
  marketCode: string;
  quantity: number;
  price: number;
}

@Controller('trade')
@UseGuards(JwtAuthGuard)
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('buy')
  async buy(@Req() req: any, @Body() request: BuyRequest): Promise<TradeResponse> {
    return this.tradeService.buyOrder(req.user.userId, request.marketCode, request.quantity, request.price);
  }

  @Post('sell')
  async sell(@Req() req: any, @Body() request: SellRequest): Promise<TradeResponse> {
    return this.tradeService.sellOrder(req.user.userId, request.marketCode, request.quantity, request.price);
  }

  @Get('history')
  async getHistory(
    @Req() req: any,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ): Promise<TradeResponse[]> {
    return this.tradeService.getTradeHistory(req.user.userId, limit, offset);
  }
}
