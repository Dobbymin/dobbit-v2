"use client";

import { AppLayout } from "@/widgets";

import { NewsListSection, SummaryNewsSection } from "@/features/news";
import { useNews } from "@/features/news/model";

export default function NewsPage() {
  const news = useNews({ limit: 100 });

  return (
    <AppLayout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-normal'>뉴스</h1>
          <p className='mt-2 text-sm text-text-muted-dark'>시장 뉴스와 분석 결과를 확인합니다.</p>
        </div>

        <SummaryNewsSection newsItems={news.data || []} isLoading={news.isLoading} />

        <NewsListSection />
      </div>
    </AppLayout>
  );
}
