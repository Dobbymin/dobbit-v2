import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { NewsCollector, NewsItem } from './news-collector';

interface NaverNewsItem {
  title: string;
  description: string;
  originallink?: string;
  link: string;
  pubDate: string;
}

interface NaverNewsResponse {
  items: NaverNewsItem[];
}

class NaverNewsRateLimitError extends Error {
  constructor() {
    super('Naver News API rate limit exceeded');
    this.name = NaverNewsRateLimitError.name;
  }
}

@Injectable()
export class NaverNewsCollector extends NewsCollector {
  private readonly logger = new Logger(NaverNewsCollector.name);
  private readonly http: AxiosInstance;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly display: number;
  private readonly coinDisplay: number;
  private readonly keywords = ['비트코인', '이더리움', '가상자산', '암호화폐', '블록체인'];

  constructor(private readonly configService: ConfigService) {
    super();
    this.clientId = this.configService.get<string>('NAVER_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET') || '';
    this.display = this.getDisplayCount();
    this.coinDisplay = this.getCoinDisplayCount();
    this.http = axios.create({
      timeout: 10000,
      baseURL: 'https://openapi.naver.com',
    });
  }

  async collect(extraKeywords?: string[]): Promise<NewsItem[]> {
    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not configured. Returning empty result.');
      return [];
    }

    const allItems: NewsItem[] = [];
    const seenUrls = new Set<string>();
    let keywordIndex = 0;

    for (const { keywords, display } of [
      { keywords: this.keywords, display: this.display },
      { keywords: extraKeywords ?? [], display: this.coinDisplay },
    ]) {
      for (const keyword of keywords) {
        keywordIndex += 1;
        try {
          const items = await this.searchNews(keyword, display);
          for (const item of items) {
            if (!seenUrls.has(item.url)) {
              seenUrls.add(item.url);
              allItems.push(item);
            }
          }
        } catch (error) {
          if (error instanceof NaverNewsRateLimitError) {
            this.logger.warn(`Rate limit hit at keyword ${keywordIndex} ("${keyword}"). Stopping collection.`);
            return allItems;
          }

          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(`Failed to fetch news for keyword "${keyword}": ${errorMessage}`);
        }
      }
    }

    return allItems;
  }

  private async searchNews(keyword: string, display: number): Promise<NewsItem[]> {
    try {
      const response = await this.http.get<NaverNewsResponse>('/v1/search/news.json', {
        params: {
          query: keyword,
          display,
          start: 1,
          sort: 'date',
        },
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
        },
      });

      const items = response.data.items || [];
      return items.map((item) => this.mapToNewsItem(item));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new NaverNewsRateLimitError();
        }
      }
      throw error;
    }
  }

  private mapToNewsItem(item: NaverNewsItem): NewsItem {
    return {
      title: this.stripHtmlEntities(item.title),
      content: this.stripHtmlEntities(item.description),
      url: item.originallink || item.link,
      source: 'NAVER',
      publishedAt: new Date(item.pubDate),
    };
  }

  private stripHtmlEntities(text: string): string {
    return text
      .replace(/<b>/g, '')
      .replace(/<\/b>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'");
  }

  private getDisplayCount(): number {
    const configured = Number(this.configService.get<string | number>('NEWS_NAVER_DISPLAY', 20));
    if (!Number.isFinite(configured)) {
      return 20;
    }

    return Math.min(100, Math.max(1, Math.floor(configured)));
  }

  private getCoinDisplayCount(): number {
    const configured = Number(this.configService.get<string | number>('NEWS_NAVER_COIN_DISPLAY', 2));
    if (!Number.isFinite(configured)) {
      return 2;
    }

    return Math.min(100, Math.max(1, Math.floor(configured)));
  }
}
