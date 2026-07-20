import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { TradeValidator } from './validators/trade.validator';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [MarketModule],
  providers: [TradeService, TradeValidator],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}
