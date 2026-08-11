import { Injectable } from '@nestjs/common';

export interface NewsItem {
  title: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
}

@Injectable()
export abstract class NewsCollector {
  abstract collect(extraKeywords?: string[]): Promise<NewsItem[]>;
}
