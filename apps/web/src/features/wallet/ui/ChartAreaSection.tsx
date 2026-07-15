"use client";

import { Skeleton } from "@/shared";

import { useHeldAssets } from "../model";

const COLORS = ["#8fa96f", "#a3d9a5", "#e0e0e0", "#5b8def", "#dd3c44", "#f0a868"];

export const ChartAreaSection = () => {
  const { data: assets, isLoading } = useHeldAssets();

  const list = (assets ?? []).filter((asset) => asset.liveEvaluatedAmount > 0);
  const total = list.reduce((sum, asset) => sum + asset.liveEvaluatedAmount, 0);

  let acc = 0;
  const stops = list
    .map((asset, index) => {
      const start = total > 0 ? (acc / total) * 100 : 0;
      acc += asset.liveEvaluatedAmount;
      const end = total > 0 ? (acc / total) * 100 : 0;
      return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
    })
    .join(", ");

  const background = list.length > 0 ? `conic-gradient(${stops})` : "#2a2a2a";

  return (
    <aside className='flex h-full w-[30%] flex-col items-center justify-center gap-4 bg-card/20 p-6'>
      <div className='relative h-[180px] w-[180px]'>
        {isLoading ? (
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
        {isLoading ? (
          <>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-4 w-12' />
          </>
        ) : list.length > 0 ? (
          list.map((asset, index) => (
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
