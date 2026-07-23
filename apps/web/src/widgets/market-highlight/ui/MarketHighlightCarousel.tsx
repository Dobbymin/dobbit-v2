"use client";

import Link from "next/link";

import { useCallback, useEffect, useRef, useState } from "react";

import { useHomeSummary, useMarketTickers } from "@/features";
import { formatCoinPrice } from "@/shared";
import type { HomeHighlight } from "@dobbit/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      className='h-[180px] w-[281px] shrink-0 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:bg-surface-sunken'
      href={`/trade/${item.marketCode}`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-foreground'>{item.koreanName}</p>
          <p className='mt-1 text-xs text-subtle-foreground'>{item.marketCode}</p>
        </div>
        <p className={`shrink-0 text-sm font-semibold tabular-nums ${changeClassName}`}>
          {formatChangeRate(signedChangeRate)}
        </p>
      </div>
      <p className='mt-4 text-xl font-bold text-foreground tabular-nums'>{formatCoinPrice(tradePrice)}</p>
      <svg
        aria-hidden='true'
        className={`mt-5 h-12 w-full ${changeClassName}`}
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
    </Link>
  );
};

const HighlightSkeleton = () => (
  <div className='h-[180px] w-[281px] shrink-0 rounded-lg border border-border bg-card p-5'>
    <div className='h-4 w-20 rounded bg-surface-sunken' />
    <div className='mt-2 h-3 w-14 rounded bg-surface-sunken' />
    <div className='mt-6 h-6 w-32 rounded bg-surface-sunken' />
    <div className='mt-6 h-12 rounded bg-surface-sunken' />
  </div>
);

export const MarketHighlightCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const homeSummaryQuery = useHomeSummary();
  const highlights = homeSummaryQuery.data?.highlights ?? [];

  const updateScrollButtons = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);

    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [highlights.length, updateScrollButtons]);

  const scrollByCard = useCallback(
    (direction: "left" | "right") => {
      scrollRef.current?.scrollBy({ left: direction === "left" ? -305 : 305 });
      updateScrollButtons();
    },
    [updateScrollButtons],
  );

  const cards: Array<HomeHighlight | null> = homeSummaryQuery.isLoading
    ? Array.from({ length: 4 }, () => null)
    : highlights;

  return (
    <section className='relative w-full overflow-hidden'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-base font-bold text-foreground'>주요 시세</h2>
        <div className='flex gap-1'>
          <button
            aria-label='이전 주요 시세'
            className='rounded-md border border-border p-1.5 text-foreground disabled:text-subtle-foreground'
            disabled={!canScrollLeft}
            onClick={() => scrollByCard("left")}
            type='button'
          >
            <ChevronLeft className='size-4' />
          </button>
          <button
            aria-label='다음 주요 시세'
            className='rounded-md border border-border p-1.5 text-foreground disabled:text-subtle-foreground'
            disabled={!canScrollRight}
            onClick={() => scrollByCard("right")}
            type='button'
          >
            <ChevronRight className='size-4' />
          </button>
        </div>
      </div>
      <div
        aria-label='주요 시세 목록'
        className='-mx-1 overflow-x-auto px-1 pb-1'
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

          event.preventDefault();
          scrollByCard(event.key === "ArrowLeft" ? "left" : "right");
        }}
        onScroll={updateScrollButtons}
        ref={scrollRef}
        tabIndex={0}
      >
        <div className='flex w-max gap-3'>
          {cards.map((item, index) =>
            item ? <HighlightCard item={item} key={item.marketCode} /> : <HighlightSkeleton key={index} />,
          )}
        </div>
      </div>
    </section>
  );
};
