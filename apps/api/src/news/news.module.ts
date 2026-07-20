import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AlertModule } from '../alert/alert.module';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NaverNewsCollector } from './collectors/naver-news.collector';
import { HermesAnalyzer } from './analyzers/hermes.analyzer';
import { GeminiAnalyzer } from './analyzers/gemini.analyzer';
import { InternalTokenGuard } from '../common/guards/internal-token.guard';
import { UpbitApiClient } from '../market/external/upbit-api.client';

@Module({
  imports: [AlertModule, HttpModule],
  providers: [
    NewsService,
    NaverNewsCollector,
    HermesAnalyzer,
    GeminiAnalyzer,
    InternalTokenGuard,
    UpbitApiClient,
  ],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
