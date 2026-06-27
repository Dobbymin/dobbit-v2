import { Body, Controller, Get, InternalServerErrorException, Post, Query, UseGuards } from '@nestjs/common';
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
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);
    const safeLimit = Number.isNaN(parsedLimit) || parsedLimit < 0 ? 20 : parsedLimit;
    const safeOffset = Number.isNaN(parsedOffset) || parsedOffset < 0 ? 0 : parsedOffset;

    return this.newsService.getArticles(safeLimit, safeOffset);
  }

  @Post('ingest')
  @UseGuards(InternalTokenGuard)
  async ingest(@Body('requestedBy') requestedBy: string = 'SCHEDULE'): Promise<NewsIngestionRunResponse> {
    const result = await this.newsService.ingest(requestedBy);

    if (result.status === 'FAILED') {
      throw new InternalServerErrorException(result);
    }

    return result;
  }

  @Post('analyze')
  async analyze(@Body('articleId') articleId: string): Promise<NewsAnalysisResponse> {
    return this.newsService.runAnalysis(articleId);
  }

  @Get('reviews')
  async getReviews(@Query('limit') limit: number = 50): Promise<PredictionReviewResponse[]> {
    return this.newsService.getPredictionReview(Number(limit));
  }

  @Post('predictions/review')
  @UseGuards(InternalTokenGuard)
  async reviewPredictions(): Promise<{ reviewedCount: number; skippedCount: number }> {
    return this.newsService.reviewPredictions();
  }
}
