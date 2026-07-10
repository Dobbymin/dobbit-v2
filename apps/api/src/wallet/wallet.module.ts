import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [MarketModule],
  providers: [WalletService, PrismaService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
