import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CashBalanceResponse, WalletHolding, WalletSummaryResponse } from '@dobbit/shared';
import { MarketService } from '../market/market.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketService: MarketService,
  ) {}

  async getCashBalance(userId: string): Promise<CashBalanceResponse> {
    const cashBalance = await this.prisma.cashBalance.findUnique({
      where: { userId },
    });

    return {
      amount: cashBalance ? Number(cashBalance.amount) : 0,
    };
  }

  async getHoldings(userId: string): Promise<WalletHolding[]> {
    const wallets = await this.prisma.wallet.findMany({
      where: {
        userId,
        quantity: { gt: 0 },
      },
      include: {
        market: true,
      },
    });

    // Parallelize getCurrentPrice calls
    const priceDataArray = await Promise.all(
      wallets.map((wallet) => this.marketService.getCurrentPrice(wallet.market.code)),
    );

    const holdings: WalletHolding[] = wallets.map((wallet, index) => {
      const priceData = priceDataArray[index];
      const currentPrice = priceData?.tradePrice ?? 0;
      const evaluatedAmount = Number(wallet.quantity) * currentPrice;
      const totalCost = Number(wallet.totalCost);
      const profitAmount = evaluatedAmount - totalCost;
      const profitRate = totalCost > 0 ? profitAmount / totalCost : 0;

      return {
        marketCode: wallet.market.code,
        symbol: wallet.market.symbol,
        quantity: Number(wallet.quantity),
        averagePrice: Number(wallet.averagePrice),
        totalCost,
        currentPrice,
        evaluatedAmount,
        profitAmount,
        profitRate,
      };
    });

    return holdings;
  }

  async getAssetSummary(userId: string): Promise<WalletSummaryResponse> {
    const cashBalance = await this.getCashBalance(userId);
    const holdings = await this.getHoldings(userId);

    const totalEvaluatedAmount = holdings.reduce((sum, h) => sum + h.evaluatedAmount, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalProfitAmount = totalEvaluatedAmount - totalCost;
    const totalProfitRate = totalCost > 0 ? totalProfitAmount / totalCost : 0;
    const totalAssetAmount = cashBalance.amount + totalEvaluatedAmount;

    return {
      cashAmount: cashBalance.amount,
      totalAssetAmount,
      totalEvaluatedAmount,
      totalProfitAmount,
      totalProfitRate,
    };
  }

  async deposit(userId: string, amount: number): Promise<{ cashBalance: number }> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('입금액은 0보다 커야 합니다.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const cashBalance = await tx.cashBalance.upsert({
        where: { userId },
        create: {
          userId,
          amount: String(amount),
        },
        update: {
          amount: {
            increment: String(amount),
          },
        },
      });

      await tx.balanceHistory.create({
        data: {
          userId,
          changeType: 'DEPOSIT',
          quantityDelta: '0',
          cashDelta: String(amount),
          reason: '현금 입금',
        },
      });

      return Number(cashBalance.amount);
    });

    return { cashBalance: result };
  }

  async withdraw(userId: string, amount: number): Promise<{ cashBalance: number }> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('출금액은 0보다 커야 합니다.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Query and validate balance inside transaction
      const cashBalance = await tx.cashBalance.findUnique({
        where: { userId },
      });

      const currentBalance = cashBalance ? Number(cashBalance.amount) : 0;

      if (currentBalance < amount) {
        throw new BadRequestException('잔액이 부족합니다.');
      }

      const updated = await tx.cashBalance.update({
        where: { userId },
        data: {
          amount: {
            decrement: String(amount),
          },
        },
      });

      await tx.balanceHistory.create({
        data: {
          userId,
          changeType: 'WITHDRAW',
          quantityDelta: '0',
          cashDelta: String(-amount),
          reason: '현금 출금',
        },
      });

      return Number(updated.amount);
    });

    return { cashBalance: result };
  }
}
