"use client";

import { Separator } from "@/shared";

import { DistributionBox, KeywordBox, NewsListHeader } from "../components";
import type { NewsSummary } from "../model";

type Props = {
  summary: NewsSummary;
  isLoading?: boolean;
};

export const SummaryNewsSection = ({ summary, isLoading }: Props) => {
  const newsDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className='bg-card p-6'>
      <NewsListHeader
        newsDate={newsDate}
        totalNews={summary.totalNews}
        investmentIndex={summary.averageInvestmentIndex}
        isLoading={isLoading}
      />

      <DistributionBox
        positive={summary.positive}
        neutral={summary.neutral}
        negative={summary.negative}
        totalNews={summary.totalNews}
        isLoading={isLoading}
      />

      <Separator className='my-6 bg-foreground/20' />

      <KeywordBox keywords={summary.topKeywords} isLoading={isLoading} />
    </section>
  );
};
