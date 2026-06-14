import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CashBalanceResponse, WalletHolding, WalletSummaryResponse } from '@dobbit/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req: any): Promise<CashBalanceResponse> {
    return this.walletService.getCashBalance(req.user.userId);
  }

  @Get('holdings')
  async getHoldings(@Req() req: any): Promise<WalletHolding[]> {
    return this.walletService.getHoldings(req.user.userId);
  }

  @Get('summary')
  async getSummary(@Req() req: any): Promise<WalletSummaryResponse> {
    return this.walletService.getAssetSummary(req.user.userId);
  }
}
