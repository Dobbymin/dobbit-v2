import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsArticleResponse, NewsAnalysisResponse, PredictionReviewResponse } from '@dobbit/shared';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('articles')
  async getArticles(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<NewsArticleResponse[]> {
    return this.newsService.getArticles(limit, offset);
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
