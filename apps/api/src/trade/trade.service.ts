import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { TradeResponse } from '@dobbit/shared';
import { TradeValidator } from './validators/trade.validator';
import { MarketService } from '../market/market.service';

@Injectable()
export class TradeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tradeValidator: TradeValidator,
    private readonly marketService: MarketService,
  ) {}

  async buyOrder(userId: string, marketCode: string, quantity: number, price: number): Promise<TradeResponse> {
    this.tradeValidator.validatePrice(price);
    this.tradeValidator.validateQuantity(quantity);

    // Validate price against current market price (±5% tolerance)
    const currentPriceData = await this.marketService.getCurrentPrice(marketCode);
    if (!currentPriceData || currentPriceData.tradePrice <= 0) {
      throw new BadRequestException('현재가를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }

    const currentPrice = currentPriceData.tradePrice;
    const tolerance = currentPrice * 0.05;
    if (price < currentPrice - tolerance || price > currentPrice + tolerance) {
      throw new BadRequestException(`주문가(${price}원)가 현재가(${currentPrice}원)에서 ±5% 범위를 벗어났습니다.`);
    }

    const market = await this.prisma.market.findUnique({
      where: { code: marketCode },
    });

    if (!market) {
      throw new NotFoundException(`마켓을 찾을 수 없습니다: ${marketCode}`);
    }

    const totalAmount = price * quantity;

    const trade = await this.prisma.$transaction(async (tx) => {
      // Query and validate cash balance inside transaction
      const cashBalance = await tx.cashBalance.findUnique({
        where: { userId },
      });

      const currentBalance = cashBalance ? Number(cashBalance.amount) : 0;
      this.tradeValidator.validateCashBalance(currentBalance, totalAmount);

      // Deduct cash
      await tx.cashBalance.update({
        where: { userId },
        data: {
          amount: {
            decrement: String(totalAmount),
          },
        },
      });

      // Update or create wallet (moving average)
      const existingWallet = await tx.wallet.findUnique({
        where: {
          userId_marketId: { userId, marketId: market.id },
        },
      });

      const newQty = (existingWallet ? Number(existingWallet.quantity) : 0) + quantity;
      const newTotalCost = (existingWallet ? Number(existingWallet.totalCost) : 0) + totalAmount;
      const newAveragePrice = newTotalCost / newQty;

      await tx.wallet.upsert({
        where: {
          userId_marketId: { userId, marketId: market.id },
        },
        create: {
          userId,
          marketId: market.id,
          quantity: String(quantity),
          averagePrice: String(newAveragePrice),
          totalCost: String(newTotalCost),
        },
        update: {
          quantity: String(newQty),
          averagePrice: String(newAveragePrice),
          totalCost: String(newTotalCost),
        },
      });

      // Create trade record
      const createdTrade = await tx.trade.create({
        data: {
          userId,
          marketId: market.id,
          type: 'BUY',
          price: String(price),
          quantity: String(quantity),
          totalAmount: String(totalAmount),
          fee: '0',
          executedAt: new Date(),
        },
      });

      // Record history
      await tx.balanceHistory.create({
        data: {
          userId,
          marketId: market.id,
          changeType: 'TRADE_BUY',
          quantityDelta: String(quantity),
          cashDelta: String(-totalAmount),
          tradeId: createdTrade.id,
        },
      });

      return createdTrade;
    });

    return {
      id: trade.id,
      marketCode: marketCode,
      side: 'BUY',
      price: Number(trade.price),
      quantity: Number(trade.quantity),
      totalAmount: Number(trade.totalAmount),
      fee: Number(trade.fee),
      executedAt: trade.executedAt.toISOString(),
    };
  }

  async sellOrder(userId: string, marketCode: string, quantity: number, price: number): Promise<TradeResponse> {
    this.tradeValidator.validatePrice(price);
    this.tradeValidator.validateQuantity(quantity);

    // Validate price against current market price (±5% tolerance)
    const currentPriceData = await this.marketService.getCurrentPrice(marketCode);
    if (!currentPriceData || currentPriceData.tradePrice <= 0) {
      throw new BadRequestException('현재가를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }

    const currentPrice = currentPriceData.tradePrice;
    const tolerance = currentPrice * 0.05;
    if (price < currentPrice - tolerance || price > currentPrice + tolerance) {
      throw new BadRequestException(`주문가(${price}원)가 현재가(${currentPrice}원)에서 ±5% 범위를 벗어났습니다.`);
    }

    const market = await this.prisma.market.findUnique({
      where: { code: marketCode },
    });

    if (!market) {
      throw new NotFoundException(`마켓을 찾을 수 없습니다: ${marketCode}`);
    }

    const totalAmount = price * quantity;

    const trade = await this.prisma.$transaction(async (tx) => {
      // Query and validate holdings inside transaction
      const wallet = await tx.wallet.findUnique({
        where: {
          userId_marketId: { userId, marketId: market.id },
        },
      });

      const currentQuantity = wallet ? Number(wallet.quantity) : 0;
      this.tradeValidator.validateHoldings(currentQuantity, quantity);

      const remainingQty = currentQuantity - quantity;

      // Add cash
      await tx.cashBalance.upsert({
        where: { userId },
        create: {
          userId,
          amount: String(totalAmount),
        },
        update: {
          amount: {
            increment: String(totalAmount),
          },
        },
      });

      // Update wallet
      if (remainingQty > 0 && wallet) {
        const newTotalCost = Number(wallet.totalCost) * (remainingQty / currentQuantity);
        const newAveragePrice = newTotalCost / remainingQty;

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            quantity: String(remainingQty),
            averagePrice: String(newAveragePrice),
            totalCost: String(newTotalCost),
          },
        });
      } else if (wallet) {
        // Delete wallet if fully sold
        await tx.wallet.delete({
          where: { id: wallet.id },
        });
      }

      // Create trade record
      const createdTrade = await tx.trade.create({
        data: {
          userId,
          marketId: market.id,
          type: 'SELL',
          price: String(price),
          quantity: String(quantity),
          totalAmount: String(totalAmount),
          fee: '0',
          executedAt: new Date(),
        },
      });

      // Record history
      await tx.balanceHistory.create({
        data: {
          userId,
          marketId: market.id,
          changeType: 'TRADE_SELL',
          quantityDelta: String(-quantity),
          cashDelta: String(totalAmount),
          tradeId: createdTrade.id,
        },
      });

      return createdTrade;
    });

    return {
      id: trade.id,
      marketCode: marketCode,
      side: 'SELL',
      price: Number(trade.price),
      quantity: Number(trade.quantity),
      totalAmount: Number(trade.totalAmount),
      fee: Number(trade.fee),
      executedAt: trade.executedAt.toISOString(),
    };
  }

  cancelOrder(tradeId: string): Promise<TradeResponse> {
    void tradeId;
    throw new BadRequestException('즉시 체결 방식이므로 취소를 지원하지 않습니다.');
  }

  async getTradeHistory(userId: string, limit = 50, offset = 0): Promise<TradeResponse[]> {
    const trades = await this.prisma.trade.findMany({
      where: { userId },
      include: {
        market: true,
      },
      orderBy: {
        executedAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return trades.map((trade) => ({
      id: trade.id,
      marketCode: trade.market.code,
      side: trade.type as 'BUY' | 'SELL',
      price: Number(trade.price),
      quantity: Number(trade.quantity),
      totalAmount: Number(trade.totalAmount),
      fee: Number(trade.fee),
      executedAt: trade.executedAt.toISOString(),
    }));
  }
}
