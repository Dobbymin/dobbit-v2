import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  providers: [NewsService, PrismaService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
