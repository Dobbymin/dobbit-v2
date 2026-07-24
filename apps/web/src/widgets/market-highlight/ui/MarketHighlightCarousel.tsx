"use client";

import Link from "next/link";

import { useHomeSummary, useMarketTickers } from "@/features";
import { formatCoinPrice } from "@/shared";
import type { HomeHighlight } from "@dobbit/shared";

const formatChangeRate = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;

const getSparklinePoints = (values: number[]) => {
  if (values.length === 0) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
      const y = range === 0 ? 50 : 95 - ((value - min) / range) * 90;

      return `${x},${y}`;
    })
    .join(" ");
};

const HighlightCard = ({ item }: { item: HomeHighlight }) => {
  const tickers = useMarketTickers([item.marketCode]);
  const ticker = tickers[item.marketCode];
  const tradePrice = ticker?.tradePrice ?? item.tradePrice;
  const signedChangeRate = ticker?.signedChangeRate ?? item.signedChangeRate;
  const changeClassName = signedChangeRate >= 0 ? "text-increase" : "text-decrease";

  return (
    <Link
      className='flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-surface-sunken'
      href={`/trade/${item.marketCode}`}
    >
      <svg
        aria-hidden='true'
        className={`h-12 w-24 shrink-0 ${changeClassName}`}
        preserveAspectRatio='none'
        viewBox='0 0 100 100'
      >
        {item.sparkline.length === 1 ? (
          <circle cx='50' cy='50' fill='currentColor' r='2.5' />
        ) : (
          <polyline
            fill='none'
            points={getSparklinePoints(item.sparkline)}
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='5'
            vectorEffect='non-scaling-stroke'
          />
        )}
      </svg>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold text-foreground'>{item.koreanName}</p>
        <div className='mt-1 flex items-baseline justify-between gap-3'>
          <p className='truncate text-base font-bold text-foreground tabular-nums'>{formatCoinPrice(tradePrice)}</p>
          <p className={`shrink-0 text-sm font-semibold tabular-nums ${changeClassName}`}>
            {formatChangeRate(signedChangeRate)}
          </p>
        </div>
      </div>
    </Link>
  );
};

const HighlightSkeleton = () => (
  <div className='flex items-center gap-4 rounded-lg border border-border bg-card p-4'>
    <div className='h-12 w-24 shrink-0 rounded bg-surface-sunken' />
    <div className='min-w-0 flex-1'>
      <div className='h-4 w-20 rounded bg-surface-sunken' />
      <div className='mt-2 h-5 w-32 rounded bg-surface-sunken' />
    </div>
    <div className='h-4 w-12 shrink-0 rounded bg-surface-sunken' />
  </div>
);

export const MarketHighlightCarousel = () => {
  const homeSummaryQuery = useHomeSummary();
  const highlights = homeSummaryQuery.data?.highlights ?? [];

  const cards: Array<HomeHighlight | null> = homeSummaryQuery.isLoading
    ? Array.from({ length: 2 }, () => null)
    : highlights;

  return (
    <section className='w-full'>
      <h2 className='mb-3 text-base font-bold text-foreground'>주요 시세</h2>
      <div aria-label='주요 시세 목록' className='flex flex-col gap-3'>
        {cards.map((item, index) =>
          item ? <HighlightCard item={item} key={item.marketCode} /> : <HighlightSkeleton key={index} />,
        )}
      </div>
    </section>
  );
};
