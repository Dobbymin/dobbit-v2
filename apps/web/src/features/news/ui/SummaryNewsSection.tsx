"use client";

import { Separator } from "@/shared";

import type { NewsListItem } from "../api";
import { DistributionBox, KeywordBox, NewsListHeader } from "../components";

type Props = {
  newsItems: NewsListItem[];
  isLoading?: boolean;
};

export const SummaryNewsSection = ({ newsItems, isLoading }: Props) => {
  // 클라이언트 집계
  const positive = newsItems.filter((item) => item.sentiment?.toUpperCase() === "POSITIVE").length;
  const negative = newsItems.filter((item) => item.sentiment?.toUpperCase() === "NEGATIVE").length;
  const neutral = newsItems.length - positive - negative;

  const investmentScores = newsItems
    .filter((item) => item.investmentScore !== null && item.investmentScore !== undefined)
    .map((item) => item.investmentScore as number);
  const avgInvestmentIndex =
    investmentScores.length > 0 ? investmentScores.reduce((a, b) => a + b, 0) / investmentScores.length : 50;

  // 키워드 빈도 계산
  const keywordMap = new Map<string, number>();
  newsItems.forEach((item) => {
    if (item.keywords && Array.isArray(item.keywords)) {
      item.keywords.forEach((keyword) => {
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
      });
    }
  });

  const topKeywords = Array.from(keywordMap.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([keyword]) => keyword);

  const newsDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className='bg-card p-6'>
      <NewsListHeader
        newsDate={newsDate}
        totalNews={newsItems.length}
        investmentIndex={avgInvestmentIndex}
        isLoading={isLoading}
      />

      <DistributionBox
        positive={positive}
        neutral={neutral}
        negative={negative}
        totalNews={newsItems.length}
        isLoading={isLoading}
      />

      <Separator className='my-6 bg-foreground/20' />

      <KeywordBox keywords={topKeywords} isLoading={isLoading} />
    </section>
  );
};
