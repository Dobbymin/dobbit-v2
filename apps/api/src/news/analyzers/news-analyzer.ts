import { Injectable } from '@nestjs/common';

export interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  summary: string;
  relatedMarkets: string[];
}

@Injectable()
export abstract class NewsAnalyzer {
  abstract analyze(content: string): Promise<AnalysisResult>;
}
