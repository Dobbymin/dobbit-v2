export type NewsSentiment = "positive" | "neutral" | "negative";

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: NewsSentiment;
  summary?: string;
};
