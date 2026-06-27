import { apiClient } from "@/shared";

import type { NewsItem, NewsSentiment } from "@/entities/news";

export type NewsApiSentiment = NewsSentiment | "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export type NewsListQuery = {
  marketCode?: string;
  sentiment?: NewsApiSentiment;
  provider?: string;
  page?: number;
  limit?: number;
  offset?: number;
};

export type NewsListItem = NewsItem & {
  sentiment?: NewsApiSentiment;
};

const toQueryString = (query?: NewsListQuery) => {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  if (query.marketCode) params.set("marketCode", query.marketCode);
  if (query.sentiment) params.set("sentiment", query.sentiment);
  if (query.provider) params.set("provider", query.provider);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));

  const value = params.toString();
  return value ? `?${value}` : "";
};

export const getNewsApi = (query?: NewsListQuery): Promise<NewsListItem[]> =>
  apiClient<NewsListItem[]>(`/news${toQueryString(query)}`);
