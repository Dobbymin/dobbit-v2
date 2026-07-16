import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { DEFAULT_HERMES_MODEL, NEWS_ANALYZER_SYSTEM_MESSAGE, NewsAnalyzer, AnalysisResult } from './news-analyzer';

@Injectable()
export class HermesAnalyzer extends NewsAnalyzer {
  private readonly hermesBaseUrl: string;
  private readonly hermesApiKey: string;
  private readonly hermesModel: string;
  private readonly hermesTimeoutMs: number;

  constructor(private readonly config: ConfigService) {
    super();
    this.hermesBaseUrl = config.get<string>('HERMES_BASE_URL', '');
    this.hermesApiKey = config.get<string>('HERMES_API_KEY', '');
    this.hermesModel = config.get<string>('HERMES_MODEL', DEFAULT_HERMES_MODEL);
    this.hermesTimeoutMs = Number(config.get<string>('HERMES_TIMEOUT_MS', '30000'));
  }

  async analyze(content: string): Promise<AnalysisResult> {
    if (!this.hermesBaseUrl || !this.hermesApiKey) {
      throw new Error('HERMES_BASE_URL 또는 HERMES_API_KEY가 설정되지 않았습니다');
    }

    interface HermesResponse {
      choices: Array<{ message: { content: string } }>;
    }

    let response: AxiosResponse<HermesResponse>;
    try {
      response = await axios.post<HermesResponse>(
        `${this.hermesBaseUrl}/v1/chat/completions`,
        {
          model: this.hermesModel,
          messages: [
            { role: 'system', content: NEWS_ANALYZER_SYSTEM_MESSAGE },
            { role: 'user', content: this.buildPrompt(content) },
          ],
          max_tokens: 800,
        },
        {
          headers: { Authorization: `Bearer ${this.hermesApiKey}` },
          timeout: this.hermesTimeoutMs,
        },
      );
    } catch (error) {
      this.logHermesError(error);
      throw error;
    }

    try {
      const choice = response.data.choices[0];
      if (!choice) {
        throw new Error('Hermes 응답에 choices가 없습니다');
      }
      const responseContent: string = choice.message.content;
      const raw = this.parseAnalysis(responseContent);
      return this.normalizeAnalysis(raw);
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 에러';
      this.logger.error(`Hermes 분석 실패(parse error): ${message}`);
      throw error;
    }
  }

  private logHermesError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      if (error.response?.status) {
        this.logger.error(`Hermes 분석 실패(HTTP ${error.response.status}): ${error.message}`);
        return;
      }

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        this.logger.error(`Hermes 분석 실패(timeout): ${error.message}`);
        return;
      }
    }

    if (error instanceof Error) {
      this.logger.error(`Hermes 분석 실패: ${error.message}`);
      return;
    }

    this.logger.error('Hermes 분석 실패: 알 수 없는 에러');
  }
}
