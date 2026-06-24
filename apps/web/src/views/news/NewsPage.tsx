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
          <h1 className='text-2xl font-bold text-white'>뉴스 목록</h1>
          <p className='mt-2 text-sm text-text-muted-dark'>AI가 분석한 코인 관련 뉴스입니다.</p>
        </div>

        <SummaryNewsSection newsItems={news.data || []} isLoading={news.isLoading} />

        <NewsListSection />
      </div>
    </AppLayout>
  );
}
