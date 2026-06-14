import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CashBalanceResponse, WalletHolding, WalletSummaryResponse } from '@dobbit/shared';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getCashBalance(userId: string): Promise<CashBalanceResponse> {
    return {
      amount: 0,
    };
  }

  async getHoldings(userId: string): Promise<WalletHolding[]> {
    return [];
  }

  async getAssetSummary(userId: string): Promise<WalletSummaryResponse> {
    return {
      cashAmount: 0,
      totalAssetAmount: 0,
      totalEvaluatedAmount: 0,
      totalProfitAmount: 0,
      totalProfitRate: 0,
    };
  }
}
