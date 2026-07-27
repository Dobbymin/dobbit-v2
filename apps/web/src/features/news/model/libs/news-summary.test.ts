import { describe, expect, it } from "vitest";

import type { NewsListItem } from "../../api";

import { getNewsSummary } from "./news-summary";

const newsItem = (id: string, overrides: Partial<NewsListItem> = {}): NewsListItem => ({
  id,
  publishedAt: "2026-07-27T00:00:00.000Z",
  publisher: "publisher",
  source: "source",
  title: "title",
  url: "https://example.com",
  ...overrides,
});

describe("getNewsSummary", () => {
  it("normalizes sentiment, clamps score, and ranks keyword frequency", () => {
    const summary = getNewsSummary([
      newsItem("positive", { investmentScore: 2, keywords: ["BTC", "ETF"], sentiment: "positive" }),
      newsItem("negative", { investmentScore: -2, keywords: ["BTC"], sentiment: "negative" }),
      newsItem("neutral", { keywords: ["ETH"], sentiment: "neutral" }),
    ]);

    expect(summary).toEqual({
      averageInvestmentIndex: 50,
      negative: 1,
      neutral: 1,
      positive: 1,
      topKeywords: ["BTC", "ETF", "ETH"],
      totalNews: 3,
    });
  });

  it("uses default investment index when scores are absent", () => {
    expect(getNewsSummary([newsItem("news")]).averageInvestmentIndex).toBe(50);
  });
});
