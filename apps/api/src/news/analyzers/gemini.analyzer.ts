import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { NewsAnalyzer, AnalysisResult } from './news-analyzer';

@Injectable()
export class GeminiAnalyzer extends NewsAnalyzer {
  private readonly geminiApiKey: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.geminiApiKey = config.get<string>('GEMINI_API_KEY', '');
  }

  async analyze(content: string): Promise<AnalysisResult> {
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다');
    }

    try {
      interface GeminiResponse {
        candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
      }

      const response = await axios.post<GeminiResponse>(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [{ parts: [{ text: this.buildPrompt(content) }] }],
          generationConfig: { maxOutputTokens: 1024 },
        },
        { timeout: 30000 },
      );

      const candidate = response.data.candidates[0];
      if (!candidate) {
        throw new Error('Gemini 응답에 candidates가 없습니다');
      }
      const part = candidate.content.parts[0];
      if (!part) {
        throw new Error('Gemini 응답에 parts가 없습니다');
      }
      const responseContent: string = part.text;
      const raw = this.parseAnalysis(responseContent);
      return this.normalizeAnalysis(raw);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Gemini 분석 실패: ${error.message}`);
      } else {
        this.logger.error('Gemini 분석 실패: 알 수 없는 에러');
      }
      throw error;
    }
  }
}
