"use client";

import type { NewsListQuery } from "../api";
import { useNewsList } from "../model";

import { NewsCard } from "./NewsCard";

type NewsListSectionProps = {
  query?: NewsListQuery;
};

export const NewsListSection = ({ query }: NewsListSectionProps) => {
  const { isLoading, newsItems, observerRef, visibleCount, visibleItems } = useNewsList(query);

  return (
    <section className='flex flex-col gap-6'>
      {isLoading && !visibleItems.length
        ? Array.from({ length: 3 }).map((_, i) => (
            <NewsCard
              key={`skeleton-${i}`}
              item={{
                id: `skeleton-${i}`,
                title: "",
                url: "",
                source: "",
                publisher: "",
                publishedAt: "",
                summary: "",
                content: "",
                reason: "",
                keywords: [],
                sentiment: undefined,
                confidence: 0,
              }}
              isLoading={true}
            />
          ))
        : null}

      {!isLoading && !newsItems.length ? (
        <p className='text-sm text-muted-foreground'>표시할 뉴스가 없습니다.</p>
      ) : null}

      {visibleItems.map((item) => (
        <NewsCard item={item} key={item.id} isLoading={isLoading} />
      ))}

      {visibleCount < newsItems.length ? <div ref={observerRef} className='h-4 w-full bg-transparent' /> : null}
    </section>
  );
};
