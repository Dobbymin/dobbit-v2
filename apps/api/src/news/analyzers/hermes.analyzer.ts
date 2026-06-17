import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { NewsAnalyzer, AnalysisResult } from './news-analyzer';

@Injectable()
export class HermesAnalyzer extends NewsAnalyzer {
  private readonly hermesBaseUrl: string;
  private readonly hermesApiKey: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.hermesBaseUrl = config.get<string>('HERMES_BASE_URL', '');
    this.hermesApiKey = config.get<string>('HERMES_API_KEY', '');
  }

  async analyze(content: string): Promise<AnalysisResult> {
    if (!this.hermesBaseUrl || !this.hermesApiKey) {
      throw new Error('HERMES_BASE_URL 또는 HERMES_API_KEY가 설정되지 않았습니다');
    }

    try {
      interface HermesResponse {
        choices: Array<{ message: { content: string } }>;
      }

      const response = await axios.post<HermesResponse>(
        `${this.hermesBaseUrl}/v1/chat/completions`,
        {
          model: 'hermes-agent',
          messages: [{ role: 'user', content: this.buildPrompt(content) }],
          max_tokens: 200,
        },
        {
          headers: { Authorization: `Bearer ${this.hermesApiKey}` },
          timeout: 30000,
        },
      );

      const choice = response.data.choices[0];
      if (!choice) {
        throw new Error('Hermes 응답에 choices가 없습니다');
      }
      const responseContent: string = choice.message.content;
      const raw = this.parseAnalysis(responseContent);
      return this.normalizeAnalysis(raw);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Hermes 분석 실패: ${error.message}`);
      } else {
        this.logger.error('Hermes 분석 실패: 알 수 없는 에러');
      }
      throw error;
    }
  }
}
