"use client";

import type { NewsListQuery } from "../api";
import { useNews } from "../model";

import { NewsCard } from "./NewsCard";

type NewsListSectionProps = {
  query?: NewsListQuery;
};

export const NewsListSection = ({ query }: NewsListSectionProps) => {
  const news = useNews(query);

  return (
    <section className='space-y-3'>
      <div>
        <h2 className='text-base font-semibold'>뉴스</h2>
      </div>
      {news.isLoading ? <p className='text-sm text-muted-foreground'>뉴스를 불러오는 중입니다.</p> : null}
      {!news.isLoading && !news.data?.length ? <p className='text-sm text-muted-foreground'>표시할 뉴스가 없습니다.</p> : null}
      {news.data?.map((item) => <NewsCard item={item} key={item.id} />)}
    </section>
  );
};
