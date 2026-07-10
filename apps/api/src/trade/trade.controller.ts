import { Controller, Post, Get, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
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

  @Post('cancel/:tradeId')
  cancel(@Req() req: UserRequest, @Param('tradeId') tradeId: string): Promise<TradeResponse> {
    void req;
    return this.tradeService.cancelOrder(tradeId);
  }

  @Get('history')
  async getHistory(
    @Req() req: UserRequest,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ): Promise<TradeResponse[]> {
    const parsedLimit = limitStr ? parseInt(limitStr, 10) : 50;
    const limit = Number.isNaN(parsedLimit) || parsedLimit < 0 ? 50 : parsedLimit;

    const parsedOffset = offsetStr ? parseInt(offsetStr, 10) : 0;
    const offset = Number.isNaN(parsedOffset) || parsedOffset < 0 ? 0 : parsedOffset;

    return this.tradeService.getTradeHistory(req.user.userId, limit, offset);
  }
}
