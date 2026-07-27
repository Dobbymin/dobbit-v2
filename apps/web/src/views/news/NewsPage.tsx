"use client";

import { AppLayout } from "@/widgets";

import { NewsListSection, SummaryNewsSection } from "@/features/news";
import { useNewsSummary } from "@/features/news/model";

export default function NewsPage() {
  const { isLoading, summary } = useNewsSummary();

  return (
    <AppLayout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>뉴스 목록</h1>
          <p className='mt-2 text-sm text-muted-foreground'>AI가 분석한 코인 관련 뉴스입니다.</p>
        </div>

        <SummaryNewsSection summary={summary} isLoading={isLoading} />

        <NewsListSection />
      </div>
    </AppLayout>
  );
}
