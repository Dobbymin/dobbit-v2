import { Injectable, Logger } from '@nestjs/common';

export interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  investmentScore: number;
  keywords: string[];
  reason: string;
  relatedMarkets: string[];
}

interface RawAnalysis {
  sentiment: string;
  confidence: number;
  investment_index: number;
  keywords: string[];
  reason: string;
  related_markets: string[];
}

@Injectable()
export abstract class NewsAnalyzer {
  protected readonly logger = new Logger(this.constructor.name);

  abstract analyze(content: string): Promise<AnalysisResult>;

  protected buildPrompt(content: string): string {
    return `다음 뉴스를 분석해줘. 아래 JSON 형식으로만 답해줘 (설명 없이 JSON만):
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0~1.0,
  "investment_index": -1.0~1.0,
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "reason": "분석 이유",
  "related_markets": ["BTC", "ETH", ...]
}

뉴스: ${content}`;
  }

  protected parseAnalysis(content: string): RawAnalysis {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`JSON 파싱 실패: ${content.slice(0, 100)}`);
    }
    return JSON.parse(jsonMatch[0]) as RawAnalysis;
  }

  protected normalizeAnalysis(raw: RawAnalysis): AnalysisResult {
    return {
      sentiment: raw.sentiment as 'positive' | 'negative' | 'neutral',
      confidence: raw.confidence,
      investmentScore: raw.investment_index,
      keywords: raw.keywords,
      reason: raw.reason,
      relatedMarkets: raw.related_markets || [],
    };
  }
}
