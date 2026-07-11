"use client";

import { useCallback, useState } from "react";

import { useIntersectionObserver } from "@/shared";

import type { NewsListQuery } from "../api";
import { useNews } from "../model";

import { NewsCard } from "./NewsCard";

type NewsListSectionProps = {
  query?: NewsListQuery;
};

const INITIAL_COUNT = 10;
const STEP = 10;

export const NewsListSection = ({ query }: NewsListSectionProps) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const news = useNews({ ...query, limit: 100 });
  const visibleItems = (news.data ?? []).slice(0, visibleCount);
  const observerRef = useIntersectionObserver(
    useCallback(() => {
      if (news.data && visibleCount < news.data.length) {
        setVisibleCount((prev) => prev + STEP);
      }
    }, [news.data, visibleCount]),
  );

  return (
    <section className='flex flex-col gap-6'>
      {news.isLoading && !visibleItems.length ? (
        Array.from({ length: 3 }).map((_, i) => (
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
      ) : null}

      {!news.isLoading && !news.data?.length ? (
        <p className='text-sm text-text-muted-dark'>표시할 뉴스가 없습니다.</p>
      ) : null}

      {visibleItems.map((item) => (
        <NewsCard item={item} key={item.id} isLoading={news.isLoading} />
      ))}

      {news.data && visibleCount < news.data.length ? (
        <div ref={observerRef} className='h-4 w-full bg-transparent' />
      ) : null}
    </section>
  );
};
