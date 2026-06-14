import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  providers: [TradeService, PrismaService],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}
