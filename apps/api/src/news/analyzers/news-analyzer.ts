import { Injectable, Logger } from '@nestjs/common';

export const DEFAULT_HERMES_MODEL = 'hermes-agent';
export const NEWS_ANALYZER_SYSTEM_MESSAGE =
  '뉴스를 투자 관점에서 분석하고 반드시 JSON 객체만 응답하세요. sentiment는 positive, negative, neutral 중 하나여야 하며 confidence는 0~1, investment_index는 -1~1 범위여야 합니다.';

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

const isValidSentiment = (sentiment: string): sentiment is AnalysisResult['sentiment'] =>
  ['positive', 'negative', 'neutral'].includes(sentiment);

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
    const fencedJsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const jsonContent = fencedJsonMatch?.[1] ?? content;
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
      throw new Error(`JSON 파싱 실패: ${content.slice(0, 100)}`);
    }

    try {
      return JSON.parse(jsonContent.slice(jsonStart, jsonEnd + 1)) as RawAnalysis;
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 에러';
      throw new Error(`JSON 파싱 실패: ${message}`);
    }
  }

  protected normalizeAnalysis(raw: RawAnalysis): AnalysisResult {
    if (!isValidSentiment(raw.sentiment)) {
      throw new Error(`sentiment 값이 유효하지 않습니다: ${raw.sentiment}`);
    }

    if (typeof raw.confidence !== 'number' || raw.confidence < 0 || raw.confidence > 1) {
      throw new Error(`confidence 값이 유효하지 않습니다: ${raw.confidence}`);
    }

    if (typeof raw.investment_index !== 'number' || raw.investment_index < -1 || raw.investment_index > 1) {
      throw new Error(`investment_index 값이 유효하지 않습니다: ${raw.investment_index}`);
    }

    return {
      sentiment: raw.sentiment,
      confidence: raw.confidence,
      investmentScore: raw.investment_index,
      keywords: raw.keywords,
      reason: raw.reason,
      relatedMarkets: raw.related_markets || [],
    };
  }
}
