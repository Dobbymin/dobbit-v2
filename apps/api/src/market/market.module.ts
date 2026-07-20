import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { UpbitApiClient } from './external/upbit-api.client';

@Module({
  imports: [HttpModule],
  providers: [UpbitApiClient, MarketService],
  controllers: [MarketController],
  exports: [MarketService],
})
export class MarketModule {}
