"use client";

import { Skeleton } from "@/shared";

import { useWalletInvestmentSummary } from "../model";

const COLORS = ["#8fa96f", "#a3d9a5", "#e0e0e0", "#5b8def", "#dd3c44", "#f0a868"];

export const ChartAreaSection = () => {
  const summary = useWalletInvestmentSummary();
  const { allocation } = summary.data;

  let acc = 0;
  const stops = allocation
    .map(({ percentage }, index) => {
      const start = acc * 100;
      acc += percentage;
      const end = acc * 100;
      return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
    })
    .join(", ");

  const background = allocation.length > 0 ? `conic-gradient(${stops})` : "#2a2a2a";

  return (
    <aside className='flex h-auto w-full flex-col items-center justify-center gap-4 bg-card/20 p-6 lg:h-full lg:w-[30%]'>
      <div className='relative h-[140px] w-[140px] sm:h-[180px] sm:w-[180px]'>
        {summary.isLoading ? (
          <Skeleton className='h-full w-full rounded-full' />
        ) : (
          <div className='h-full w-full rounded-full' style={{ background }} />
        )}
        <div className='absolute inset-[28%] flex flex-col items-center justify-center rounded-full bg-background'>
          <p className='text-xs text-muted-foreground'>보유 비중</p>
          <p className='text-xs text-muted-foreground'>(%)</p>
        </div>
      </div>
      <div className='flex flex-wrap justify-center gap-2'>
        {summary.isLoading ? (
          <>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-4 w-12' />
          </>
        ) : allocation.length > 0 ? (
          allocation.map(({ asset }, index) => (
            <span key={asset.symbol} className='flex items-center gap-1 text-xs text-muted-foreground'>
              <span
                className='inline-block size-2 rounded-full'
                style={{ background: COLORS[index % COLORS.length] }}
              />
              {asset.symbol}
            </span>
          ))
        ) : (
          <span className='text-xs text-muted-foreground'>보유 자산 없음</span>
        )}
      </div>
    </aside>
  );
};
