import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { TradeResponse } from '@dobbit/shared';

@Injectable()
export class TradeService {
  constructor(private readonly prisma: PrismaService) {}

  buyOrder(userId: string, marketCode: string, quantity: number, price: number): Promise<TradeResponse> {
    void userId;
    void marketCode;
    void quantity;
    void price;
    return Promise.resolve({} as TradeResponse);
  }

  sellOrder(userId: string, marketCode: string, quantity: number, price: number): Promise<TradeResponse> {
    void userId;
    void marketCode;
    void quantity;
    void price;
    return Promise.resolve({} as TradeResponse);
  }

  cancelOrder(tradeId: string): Promise<TradeResponse> {
    void tradeId;
    return Promise.resolve({} as TradeResponse);
  }

  getTradeHistory(userId: string, limit = 50, offset = 0): Promise<TradeResponse[]> {
    void userId;
    void limit;
    void offset;
    return Promise.resolve<TradeResponse[]>([]);
  }
}
