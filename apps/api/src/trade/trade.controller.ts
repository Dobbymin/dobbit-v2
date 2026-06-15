import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
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

interface UserRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('api/trade')
@UseGuards(JwtAuthGuard)
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('buy')
  async buy(@Req() req: UserRequest, @Body() request: BuyRequest): Promise<TradeResponse> {
    return this.tradeService.buyOrder(req.user.userId, request.marketCode, request.quantity, request.price);
  }

  @Post('sell')
  async sell(@Req() req: UserRequest, @Body() request: SellRequest): Promise<TradeResponse> {
    return this.tradeService.sellOrder(req.user.userId, request.marketCode, request.quantity, request.price);
  }

  @Get('history')
  async getHistory(
    @Req() req: UserRequest,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ): Promise<TradeResponse[]> {
    return this.tradeService.getTradeHistory(req.user.userId, limit, offset);
  }
}
