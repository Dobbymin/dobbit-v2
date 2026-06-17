import { Module } from '@nestjs/common';
import { AlertModule } from '../alert/alert.module';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { NaverNewsCollector } from './collectors/naver-news.collector';
import { HermesAnalyzer } from './analyzers/hermes.analyzer';
import { GeminiAnalyzer } from './analyzers/gemini.analyzer';
import { InternalTokenGuard } from '../common/guards/internal-token.guard';

@Module({
  imports: [AlertModule],
  providers: [NewsService, PrismaService, NaverNewsCollector, HermesAnalyzer, GeminiAnalyzer, InternalTokenGuard],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
