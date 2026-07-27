"use client";

import Link from "next/link";

import { useHomeNews } from "../model";

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
  const { isLoading, news } = useHomeNews();

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
      <div className='min-h-0 rounded-lg border border-border bg-card px-5 py-3 lg:flex-1 lg:overflow-y-auto'>
        {isLoading ? (
          Array.from({ length: 6 }, (_, index) => <NewsSkeleton key={index} />)
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
                <p className='mt-1 text-xs text-subtle-foreground'>{item.relativeTime}</p>
              </div>
              <span
                className={`shrink-0 rounded-md bg-surface-sunken px-2 py-1 text-xs font-semibold ${item.sentimentClassName}`}
              >
                {item.sentimentLabel}
              </span>
            </article>
          ))
        )}
      </div>
    </section>
  );
};
