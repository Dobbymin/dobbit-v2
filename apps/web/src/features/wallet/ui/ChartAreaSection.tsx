"use client";

import { useWalletAssets } from "../model";

const COLORS = ["#8fa96f", "#a3d9a5", "#e0e0e0", "#5b8def", "#dd3c44", "#f0a868"];

export const ChartAreaSection = () => {
  const assets = useWalletAssets();

  const list = (assets.data ?? []).filter((asset) => asset.evaluatedAmount > 0);
  const total = list.reduce((sum, asset) => sum + asset.evaluatedAmount, 0);

  let acc = 0;
  const stops = list
    .map((asset, index) => {
      const start = total > 0 ? (acc / total) * 100 : 0;
      acc += asset.evaluatedAmount;
      const end = total > 0 ? (acc / total) * 100 : 0;
      return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
    })
    .join(", ");

  const background = list.length > 0 ? `conic-gradient(${stops})` : "#2a2a2a";

  return (
    <aside className='flex h-full w-[30%] flex-col items-center justify-center gap-4 bg-surface-dark/20 p-6'>
      <div className='relative h-[180px] w-[180px]'>
        <div className='h-full w-full rounded-full' style={{ background }} />
        <div className='absolute inset-[28%] flex flex-col items-center justify-center rounded-full bg-background'>
          <p className='text-xs text-text-muted-dark'>보유 비중</p>
          <p className='text-xs text-text-muted-dark'>(%)</p>
        </div>
      </div>
      <div className='flex flex-wrap justify-center gap-2'>
        {assets.isLoading ? (
          <span className='text-xs text-text-muted-dark'>불러오는 중...</span>
        ) : list.length > 0 ? (
          list.map((asset, index) => (
            <span key={asset.symbol} className='flex items-center gap-1 text-xs text-text-muted-dark'>
              <span
                className='inline-block size-2 rounded-full'
                style={{ background: COLORS[index % COLORS.length] }}
              />
              {asset.symbol}
            </span>
          ))
        ) : (
          <span className='text-xs text-text-muted-dark'>보유 자산 없음</span>
        )}
      </div>
    </aside>
  );
};
