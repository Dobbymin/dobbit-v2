import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { TradeResponse } from '@dobbit/shared';

@Injectable()
export class TradeService {
  constructor(private readonly prisma: PrismaService) {}

  async buyOrder(userId: string, marketCode: string, quantity: number, price: number): Promise<TradeResponse> {
    return {} as TradeResponse;
  }

  async sellOrder(userId: string, marketCode: string, quantity: number, price: number): Promise<TradeResponse> {
    return {} as TradeResponse;
  }

  async cancelOrder(tradeId: string): Promise<TradeResponse> {
    return {} as TradeResponse;
  }

  async getTradeHistory(userId: string, limit: number = 50, offset: number = 0): Promise<TradeResponse[]> {
    return [];
  }
}
