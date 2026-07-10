import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { WalletService } from './wallet.service';
import { CashBalanceResponse, WalletHolding, WalletSummaryResponse } from '@dobbit/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface UserRequest extends Request {
  user: {
    userId: string;
  };
}

interface DepositRequest {
  amount: number;
}

interface WithdrawRequest {
  amount: number;
}

interface CashBalanceResult {
  cashBalance: number;
}

@Controller('api/wallet')
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

  @Post('deposit')
  async deposit(@Req() req: UserRequest, @Body() request: DepositRequest): Promise<CashBalanceResult> {
    return this.walletService.deposit(req.user.userId, request.amount);
  }

  @Post('withdraw')
  async withdraw(@Req() req: UserRequest, @Body() request: WithdrawRequest): Promise<CashBalanceResult> {
    return this.walletService.withdraw(req.user.userId, request.amount);
  }
}
