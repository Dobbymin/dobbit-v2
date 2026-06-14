import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { CashBalanceResponse, WalletHolding, WalletSummaryResponse } from '@dobbit/shared';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  getCashBalance(userId: string): Promise<CashBalanceResponse> {
    void userId;
    return Promise.resolve({
      amount: 0,
    });
  }

  getHoldings(userId: string): Promise<WalletHolding[]> {
    void userId;
    return Promise.resolve<WalletHolding[]>([]);
  }

  getAssetSummary(userId: string): Promise<WalletSummaryResponse> {
    void userId;
    return Promise.resolve({
      cashAmount: 0,
      totalAssetAmount: 0,
      totalEvaluatedAmount: 0,
      totalProfitAmount: 0,
      totalProfitRate: 0,
    });
  }
}
