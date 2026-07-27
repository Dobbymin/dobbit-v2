import type { NewsListItem } from "../../api";

export type NewsSummary = {
  averageInvestmentIndex: number;
  negative: number;
  neutral: number;
  positive: number;
  topKeywords: string[];
  totalNews: number;
};

export const getNewsSummary = (newsItems: NewsListItem[]): NewsSummary => {
  const positive = newsItems.filter((item) => item.sentiment?.toUpperCase() === "POSITIVE").length;
  const negative = newsItems.filter((item) => item.sentiment?.toUpperCase() === "NEGATIVE").length;
  const investmentScores = newsItems.flatMap((item) =>
    item.investmentScore === null || item.investmentScore === undefined ? [] : [item.investmentScore],
  );
  const averageScore =
    investmentScores.length > 0
      ? investmentScores.reduce((total, score) => total + score, 0) / investmentScores.length
      : null;
  const keywordCount = new Map<string, number>();

  newsItems.forEach((item) => {
    item.keywords?.forEach((keyword) => keywordCount.set(keyword, (keywordCount.get(keyword) ?? 0) + 1));
  });

  return {
    averageInvestmentIndex: averageScore === null ? 50 : Math.min(100, Math.max(0, (averageScore + 1) * 50)),
    negative,
    neutral: newsItems.length - positive - negative,
    positive,
    topKeywords: Array.from(keywordCount.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([keyword]) => keyword),
    totalNews: newsItems.length,
  };
};
