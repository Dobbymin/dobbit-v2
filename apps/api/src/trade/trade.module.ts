import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { TradeValidator } from './validators/trade.validator';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [MarketModule],
  providers: [TradeService, PrismaService, TradeValidator],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}
