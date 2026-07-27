"use client";

import Link from "next/link";

import type { HighlightDisplayCard } from "../model";
import { useMarketHighlights } from "../model";

const HighlightCard = ({ item }: { item: HighlightDisplayCard }) => {
  const gradientId = `market-highlight-${item.marketCode}`;

  return (
    <Link
      className='flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-surface-sunken'
      href={`/trade/${item.marketCode}`}
    >
      <div>
        <p className='text-sm font-semibold text-foreground'>{item.koreanName}</p>
        <div className='flex items-baseline gap-2'>
          <p className='text-xl font-bold text-foreground tabular-nums'>{item.formattedTradePrice}</p>
          <p className={`text-sm font-semibold tabular-nums ${item.changeClassName}`}>{item.formattedChangeRate}</p>
        </div>
      </div>
      <svg
        aria-hidden='true'
        className={`h-12 w-full ${item.changeClassName}`}
        preserveAspectRatio='none'
        viewBox='0 0 100 100'
      >
        <defs>
          <linearGradient id={gradientId} x1='0' x2='0' y1='0' y2='1'>
            <stop offset='0%' stopColor='currentColor' stopOpacity='0.2' />
            <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
          </linearGradient>
        </defs>
        <path
          d='M 0 50 H 100'
          fill='none'
          opacity='0.2'
          stroke='currentColor'
          strokeDasharray='2 3'
          strokeWidth='1'
          vectorEffect='non-scaling-stroke'
        />
        {item.sparkline.length > 1 ? (
          <path d={`${item.sparklinePath} L 100 100 L 0 100 Z`} fill={`url(#${gradientId})`} />
        ) : null}
        {item.sparkline.length === 1 ? (
          <circle cx='50' cy='50' fill='currentColor' r='2.5' />
        ) : (
          <path
            d={item.sparklinePath}
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.5'
            vectorEffect='non-scaling-stroke'
          />
        )}
      </svg>
      <div className='border-t border-border pt-4'>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <p className='text-xs text-subtle-foreground'>24시간 고가</p>
            <p className='text-sm font-medium text-foreground tabular-nums'>{item.formattedHigh24h}</p>
          </div>
          <div>
            <p className='text-xs text-subtle-foreground'>24시간 저가</p>
            <p className='text-sm font-medium text-foreground tabular-nums'>{item.formattedLow24h}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const HighlightSkeleton = () => (
  <div className='flex flex-col gap-4 rounded-lg border border-border bg-card p-5'>
    <div>
      <div className='h-4 w-20 rounded bg-surface-sunken' />
      <div className='mt-2 h-5 w-32 rounded bg-surface-sunken' />
    </div>
    <div className='h-12 w-full rounded bg-surface-sunken' />
    <div className='grid grid-cols-2 gap-3 border-t border-border pt-4'>
      <div>
        <div className='h-3 w-16 rounded bg-surface-sunken' />
        <div className='mt-2 h-4 w-20 rounded bg-surface-sunken' />
      </div>
      <div>
        <div className='h-3 w-16 rounded bg-surface-sunken' />
        <div className='mt-2 h-4 w-20 rounded bg-surface-sunken' />
      </div>
    </div>
  </div>
);

export const MarketHighlightCarousel = () => {
  const { cards: highlights, isLoading } = useMarketHighlights();
  const cards = isLoading ? Array.from({ length: 2 }, () => null) : highlights;

  return (
    <section className='w-full lg:flex lg:h-full lg:min-h-0 lg:flex-col'>
      <h2 className='mb-3 text-base font-bold text-foreground'>주요 시세</h2>
      <div aria-label='주요 시세 목록' className='flex min-h-0 flex-col gap-3 lg:flex-1'>
        {cards.map((item, index) =>
          item ? <HighlightCard item={item} key={item.marketCode} /> : <HighlightSkeleton key={index} />,
        )}
      </div>
    </section>
  );
};
