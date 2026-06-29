export type NewsSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";
export type NewsProvider = "HERMES" | "GEMINI";
export type NewsRunStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
export type PredictionDirection = "UP" | "DOWN" | "FLAT";
export type FeedbackLabel = "GOOD" | "BAD" | "NEEDS_REVIEW";

export interface NewsArticleResponse {
  id: string;
  title: string;
  source: string;
  publisher: string;
  url: string;
  publishedAt: string;
  summary: string;
}

export interface NewsAnalysisResponse {
  id: string;
  provider: NewsProvider;
  sentiment: NewsSentiment;
  confidence: number;
  investmentScore: number;
  keywords: string[];
  reason: string;
  modelVersion: string;
  analyzedAt: string;
}

export interface NewsItem extends NewsArticleResponse {
  marketCode?: string;
  content?: string;
  sentiment?: NewsSentiment | null;
  provider?: NewsProvider | null;
  confidence?: number | null;
  investmentScore?: number | null;
  reason?: string | null;
  keywords?: string[] | null;
}

export interface NewsDetailResponse extends NewsArticleResponse {
  content: string;
  marketTags: Array<{
    marketCode: string;
    symbol: string;
    confidence: number;
  }>;
  analyses: NewsAnalysisResponse[];
}

export interface NewsListQuery {
  marketCode?: string;
  sentiment?: NewsSentiment;
  provider?: NewsProvider;
  page?: number;
  limit?: number;
}

export interface NewsAnalysisRunResponse {
  runId: string;
  provider: NewsProvider;
  status: NewsRunStatus;
  targetDate: string | null;
  createdAt: string;
}

export interface NewsIngestionRunResponse {
  runId: string;
  status: NewsRunStatus;
  source: string;
  targetDate: string;
  createdAt: string;
}

export interface PredictionReviewResponse {
  id: string;
  newsAnalysisId: string;
  marketCode: string;
  provider: NewsProvider;
  predictedDirection: PredictionDirection;
  actualDirection: PredictionDirection;
  isMatched: boolean;
  errorRate: number;
  reviewedAt: string;
}

export interface LearningSampleResponse {
  id: string;
  newsAnalysisId: string;
  predictionReviewId: string;
  feedbackLabel: FeedbackLabel;
  createdAt: string;
}
