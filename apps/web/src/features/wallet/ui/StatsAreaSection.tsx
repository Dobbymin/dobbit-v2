"use client";

import { Separator, Skeleton } from "@/shared";

import { useWalletAssets, useWalletSummary } from "../model";

type StatItemProps = {
  label: string;
  value: string;
  unit: string;
};

const StatItem = ({ label, value, unit }: StatItemProps) => {
  return (
    <div className='flex w-full items-center justify-between'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <div className='flex items-end gap-1'>
        <span className='text-lg font-bold text-foreground'>{value}</span>
        <span className='text-xs font-bold text-muted-foreground'>{unit}</span>
      </div>
    </div>
  );
};

const formatKRW = (value: number) => value.toLocaleString("ko-KR");
const withSign = (value: number) => `${value >= 0 ? "+" : ""}${formatKRW(value)}`;

export const StatsAreaSection = () => {
  const summary = useWalletSummary();
  const assets = useWalletAssets();

  const list = assets.data ?? [];
  const totalPurchase = list.reduce((sum, asset) => sum + asset.totalCost, 0);
  const totalEvaluation = list.reduce((sum, asset) => sum + asset.evaluatedAmount, 0);

  const data = summary.data;

  if (summary.isLoading || assets.isLoading) {
    return (
      <article className='flex h-full w-[70%] flex-col bg-card/20 px-2 py-6'>
        <div className='flex w-full justify-between gap-10 px-6 py-4'>
          <div className='flex w-full items-center justify-between'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-5 w-32' />
          </div>
          <div className='flex w-full items-center justify-between'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-5 w-32' />
          </div>
        </div>

        <Separator className='my-4 border-t border-border/10' />

        <div className='flex w-full justify-between gap-10 px-6 py-6'>
          <div className='flex w-full items-center justify-between'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-5 w-32' />
          </div>
          <div className='flex w-full items-center justify-between'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-5 w-32' />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className='flex h-full w-[70%] flex-col bg-card/20 px-2 py-6'>
      <div className='flex w-full justify-between gap-10 px-6 py-4'>
        <StatItem label='보유 KRW' value={formatKRW(data?.cashAmount ?? 0)} unit='KRW' />
        <StatItem label='총보유 자산' value={formatKRW(data?.totalAssetAmount ?? 0)} unit='KRW' />
      </div>

      <Separator className='my-4 border-t border-border/10' />

      <div className='flex w-full justify-between gap-10 px-6 py-6'>
        <StatItem label='총 매수' value={formatKRW(totalPurchase)} unit='KRW' />
        <StatItem label='총 평가 손익' value={withSign(data?.totalProfitAmount ?? 0)} unit='KRW' />
      </div>
      <div className='flex w-full justify-between gap-10 px-6 py-4'>
        <StatItem label='총 평가' value={formatKRW(totalEvaluation)} unit='KRW' />
        <StatItem
          label='총 평가 수익률'
          value={`${(data?.totalProfitRate ?? 0) * 100 >= 0 ? "+" : ""}${((data?.totalProfitRate ?? 0) * 100).toFixed(2)}`}
          unit='%'
        />
      </div>
    </article>
  );
};
