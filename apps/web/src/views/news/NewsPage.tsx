import { AppLayout } from "@/widgets";

import { NewsListSection } from "@/features/news";

export default function NewsPage() {
  return (
    <AppLayout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-normal'>뉴스</h1>
          <p className='mt-2 text-sm text-muted-foreground'>시장 뉴스와 분석 결과를 확인합니다.</p>
        </div>
        <NewsListSection />
      </div>
    </AppLayout>
  );
}
