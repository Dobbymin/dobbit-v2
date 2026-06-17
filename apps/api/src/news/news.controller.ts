import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsAnalysisResponse, PredictionReviewResponse, NewsItem } from '@dobbit/shared';
import { InternalTokenGuard } from '../common/guards/internal-token.guard';

interface NewsIngestionRunResponse {
  id: string;
  source: string;
  status: string;
  targetDate: Date;
  requestedBy: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  errorMessage: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
}

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('articles')
  async getArticles(@Query('limit') limit: number = 20, @Query('offset') offset: number = 0): Promise<NewsItem[]> {
    return this.newsService.getArticles(limit, offset);
  }

  @Post('ingest')
  @UseGuards(InternalTokenGuard)
  async ingest(@Body('requestedBy') requestedBy: string = 'SCHEDULE'): Promise<NewsIngestionRunResponse> {
    return this.newsService.ingest(requestedBy);
  }

  @Post('analyze')
  async analyze(@Body('articleId') articleId: string): Promise<NewsAnalysisResponse> {
    return this.newsService.runAnalysis(articleId);
  }

  @Get('reviews')
  async getReviews(@Query('limit') limit: number = 10): Promise<PredictionReviewResponse[]> {
    return this.newsService.getPredictionReview(limit);
  }
}
