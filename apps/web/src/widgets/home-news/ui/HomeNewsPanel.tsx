"use client";

import Link from "next/link";

import { useHomeSummary } from "@/features";
import type { HomeNewsItem } from "@dobbit/shared";

const formatRelativeTime = (publishedAt: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(publishedAt).getTime()) / 60_000));

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / 1_440)}일 전`;
};

const getSentimentClassName = (sentiment: HomeNewsItem["sentiment"]) => {
  if (sentiment === "POSITIVE") return "text-increase";
  if (sentiment === "NEGATIVE") return "text-decrease";
  return "text-subtle-foreground";
};

const getSentimentLabel = (sentiment: HomeNewsItem["sentiment"]) => {
  if (sentiment === "POSITIVE") return "호재";
  if (sentiment === "NEGATIVE") return "악재";
  return "중립";
};

const NewsSkeleton = () => (
  <div className='flex items-center justify-between gap-4 border-b border-border py-4'>
    <div className='min-w-0 flex-1'>
      <div className='h-4 w-3/4 rounded bg-surface-sunken' />
      <div className='mt-2 h-3 w-28 rounded bg-surface-sunken' />
    </div>
    <div className='h-6 w-10 rounded bg-surface-sunken' />
  </div>
);

export const HomeNewsPanel = () => {
  const homeSummaryQuery = useHomeSummary();
  const news = homeSummaryQuery.data?.news.slice(0, 7) ?? [];

  return (
    <section className='lg:flex lg:h-full lg:min-h-0 lg:flex-col'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <h2 className='text-base font-bold text-foreground'>뉴스</h2>
        <Link
          className='text-sm font-semibold text-subtle-foreground transition-colors hover:text-foreground'
          href='/news'
        >
          전체 보기
        </Link>
      </div>
      <div className='rounded-lg border border-border bg-card p-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto'>
        {homeSummaryQuery.isLoading ? (
          Array.from({ length: 7 }, (_, index) => <NewsSkeleton key={index} />)
        ) : news.length === 0 ? (
          <p className='py-12 text-center text-sm text-subtle-foreground'>아직 수집된 뉴스가 없어요</p>
        ) : (
          news.map((item) => (
            <article className='flex items-center gap-4 border-b border-border py-4 last:border-b-0' key={item.id}>
              <div className='min-w-0 flex-1'>
                <a
                  className='block truncate text-sm font-semibold text-foreground transition-colors hover:text-subtle-foreground'
                  href={item.url}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {item.title}
                </a>
                <p className='mt-1 text-xs text-subtle-foreground'>{formatRelativeTime(item.publishedAt)}</p>
              </div>
              <span
                className={`shrink-0 rounded-md bg-surface-sunken px-2 py-1 text-xs font-semibold ${getSentimentClassName(item.sentiment)}`}
              >
                {getSentimentLabel(item.sentiment)}
              </span>
            </article>
          ))
        )}
      </div>
    </section>
  );
};
