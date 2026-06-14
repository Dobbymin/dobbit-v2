import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { WalletService } from './wallet.service';
import { CashBalanceResponse, WalletHolding, WalletSummaryResponse } from '@dobbit/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface UserRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req: UserRequest): Promise<CashBalanceResponse> {
    return this.walletService.getCashBalance(req.user.userId);
  }

  @Get('holdings')
  async getHoldings(@Req() req: UserRequest): Promise<WalletHolding[]> {
    return this.walletService.getHoldings(req.user.userId);
  }

  @Get('summary')
  async getSummary(@Req() req: UserRequest): Promise<WalletSummaryResponse> {
    return this.walletService.getAssetSummary(req.user.userId);
  }
}
