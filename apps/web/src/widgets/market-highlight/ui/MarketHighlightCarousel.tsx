"use client";

import Link from "next/link";

import { useHomeSummary, useMarketTickers } from "@/features";
import { formatCoinPrice } from "@/shared";
import type { HomeHighlight } from "@dobbit/shared";

const formatChangeRate = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;

const getSparklinePath = (values: number[]) => {
  if (values.length === 0) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const points = values.map((value, index) => ({
    x: values.length === 1 ? 50 : (index / (values.length - 1)) * 100,
    y: range === 0 ? 50 : 95 - ((value - min) / range) * 90,
  }));

  const firstPoint = points[0];
  if (!firstPoint) return "";

  if (points.length === 1) return `M ${firstPoint.x} ${firstPoint.y}`;

  return points.slice(1).reduce((path, point, index) => {
    const previousPoint = points[index] ?? point;
    const pointBeforePrevious = points[index - 1] ?? previousPoint;
    const pointAfterCurrent = points[index + 2] ?? point;
    const controlPoint1 = {
      x: previousPoint.x + (point.x - pointBeforePrevious.x) / 6,
      y: previousPoint.y + (point.y - pointBeforePrevious.y) / 6,
    };
    const controlPoint2 = {
      x: point.x - (pointAfterCurrent.x - previousPoint.x) / 6,
      y: point.y - (pointAfterCurrent.y - previousPoint.y) / 6,
    };

    return `${path} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${point.x} ${point.y}`;
  }, `M ${firstPoint.x} ${firstPoint.y}`);
};

const HighlightCard = ({ item }: { item: HomeHighlight }) => {
  const tickers = useMarketTickers([item.marketCode]);
  const ticker = tickers[item.marketCode];
  const tradePrice = ticker?.tradePrice ?? item.tradePrice;
  const signedChangeRate = ticker?.signedChangeRate ?? item.signedChangeRate;
  const changeClassName = signedChangeRate >= 0 ? "text-increase" : "text-decrease";

  return (
    <Link
      className='flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-surface-sunken'
      href={`/trade/${item.marketCode}`}
    >
      <div>
        <p className='text-sm font-semibold text-foreground'>{item.koreanName}</p>
        <div className='flex items-baseline gap-2'>
          <p className='text-xl font-bold text-foreground tabular-nums'>{formatCoinPrice(tradePrice)}</p>
          <p className={`text-sm font-semibold tabular-nums ${changeClassName}`}>{formatChangeRate(signedChangeRate)}</p>
        </div>
      </div>
      <svg
        aria-hidden='true'
        className={`h-12 w-full ${changeClassName}`}
        preserveAspectRatio='none'
        viewBox='0 0 100 100'
      >
        {item.sparkline.length === 1 ? (
          <circle cx='50' cy='50' fill='currentColor' r='2.5' />
        ) : (
          <path
            d={getSparklinePath(item.sparkline)}
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
            <p className='text-sm font-medium text-foreground tabular-nums'>{formatCoinPrice(item.high24h)}</p>
          </div>
          <div>
            <p className='text-xs text-subtle-foreground'>24시간 저가</p>
            <p className='text-sm font-medium text-foreground tabular-nums'>{formatCoinPrice(item.low24h)}</p>
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
