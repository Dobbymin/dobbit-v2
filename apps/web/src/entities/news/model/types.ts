export type NewsSentiment = "positive" | "neutral" | "negative";

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  publisher: string;
  url: string;
  publishedAt: string;
  summary?: string;
  content?: string | null;
  sentiment?: NewsSentiment | null;
  provider?: string | null;
  confidence?: number | null;
  investmentScore?: number | null;
  reason?: string | null;
  keywords?: string[] | null;
};
