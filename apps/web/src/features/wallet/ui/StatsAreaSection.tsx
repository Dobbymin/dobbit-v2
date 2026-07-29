"use client";

import { Separator, Skeleton } from "@/shared";

import { useWalletInvestmentSummary } from "../model";

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
        <span className='text-base font-bold text-foreground tabular-nums sm:text-lg'>{value}</span>
        <span className='text-xs font-bold text-muted-foreground'>{unit}</span>
      </div>
    </div>
  );
};

const formatKRW = (value: number) => value.toLocaleString("ko-KR");
const withSign = (value: number) => `${value >= 0 ? "+" : ""}${formatKRW(value)}`;

export const StatsAreaSection = () => {
  const summary = useWalletInvestmentSummary();

  if (summary.isLoading) {
    return (
      <article className='flex h-auto w-full flex-col bg-card/20 px-2 py-6 lg:h-full lg:w-[70%]'>
        <div className='flex w-full flex-col gap-3 px-3 py-3 sm:flex-row sm:justify-between sm:gap-10 sm:px-6 sm:py-4'>
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

        <div className='flex w-full flex-col gap-3 px-3 py-3 sm:flex-row sm:justify-between sm:gap-10 sm:px-6 sm:py-4'>
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

        <div className='flex w-full flex-col gap-3 px-3 py-3 sm:flex-row sm:justify-between sm:gap-10 sm:px-6 sm:py-4'>
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
    <article className='flex h-auto w-full flex-col bg-card/20 px-2 py-6 lg:h-full lg:w-[70%]'>
      <div className='flex w-full flex-col gap-3 px-3 py-3 sm:flex-row sm:justify-between sm:gap-10 sm:px-6 sm:py-4'>
        <StatItem label='보유 KRW' value={formatKRW(summary.data.cashAmount)} unit='KRW' />
        <StatItem label='총보유 자산' value={formatKRW(summary.data.totalAssetAmount)} unit='KRW' />
      </div>

      <Separator className='my-4 border-t border-border/10' />

      <div className='flex w-full flex-col gap-3 px-3 py-3 sm:flex-row sm:justify-between sm:gap-10 sm:px-6 sm:py-4'>
        <StatItem label='총 매수' value={formatKRW(summary.data.totalPurchaseAmount)} unit='KRW' />
        <StatItem label='총 평가 손익' value={withSign(summary.data.totalProfitAmount)} unit='KRW' />
      </div>

      <Separator className='my-4 border-t border-border/10' />

      <div className='flex w-full flex-col gap-3 px-3 py-3 sm:flex-row sm:justify-between sm:gap-10 sm:px-6 sm:py-4'>
        <StatItem label='총 평가' value={formatKRW(summary.data.totalEvaluatedAmount)} unit='KRW' />
        <StatItem
          label='총 평가 수익률'
          value={`${summary.data.totalProfitRate * 100 >= 0 ? "+" : ""}${(summary.data.totalProfitRate * 100).toFixed(2)}`}
          unit='%'
        />
      </div>
    </article>
  );
};
