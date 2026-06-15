import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MarketModule } from '../market/market.module';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { MarketTickerPoller } from './market-ticker.poller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    MarketModule,
  ],
  providers: [RealtimeGateway, RealtimeService, WsJwtGuard, MarketTickerPoller],
  exports: [RealtimeService],
})
export class RealtimeModule {}
