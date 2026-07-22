import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { UpbitApiClient } from '../market/external/upbit-api.client';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [HomeController],
  providers: [HomeService, UpbitApiClient],
})
export class HomeModule {}
