import { Injectable } from '@nestjs/common';
import { NewsCollector, NewsItem } from './news-collector';

@Injectable()
export class NaverNewsCollector extends NewsCollector {
  async collect(): Promise<NewsItem[]> {
    // TODO: Implement Naver news collection
    // 1. Query Naver news API or scrape
    // 2. Filter for crypto/market related news
    // 3. Parse and return items
    return [];
  }
}
