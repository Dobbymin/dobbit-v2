import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MarketModule } from './market/market.module';
import { TradeModule } from './trade/trade.module';
import { WalletModule } from './wallet/wallet.module';
import { AlertModule } from './alert/alert.module';
import { NewsModule } from './news/news.module';
import { RealtimeModule } from './realtime/realtime.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MarketModule,
    TradeModule,
    WalletModule,
    AlertModule,
    NewsModule,
    RealtimeModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
