"use client";

import { Badge, formatPrice } from "@/shared";

import { useWalletSummary } from "../model";

const formatRate = (value: number) => `${value.toFixed(2)}%`;

export const StatsAreaSection = () => {
  const summary = useWalletSummary();

  if (summary.isLoading) {
    return (
      <section className='rounded-lg border bg-card p-5'>
        <p className='text-sm text-muted-foreground'>평가 현황을 불러오는 중입니다.</p>
      </section>
    );
  }

  const data = summary.data;

  return (
    <section className='grid gap-3 rounded-lg border bg-card p-5 sm:grid-cols-3'>
      <div>
        <p className='text-sm text-muted-foreground'>총 자산</p>
        <p className='mt-2 text-xl font-semibold'>{formatPrice(data?.totalAssetValue ?? 0)}</p>
      </div>
      <div>
        <p className='text-sm text-muted-foreground'>평가손익</p>
        <p className='mt-2 text-xl font-semibold'>{formatPrice(data?.totalProfitLoss ?? 0)}</p>
      </div>
      <div>
        <p className='text-sm text-muted-foreground'>수익률</p>
        <Badge className='mt-2' variant={(data?.totalProfitLossRate ?? 0) >= 0 ? "default" : "destructive"}>
          {formatRate(data?.totalProfitLossRate ?? 0)}
        </Badge>
      </div>
    </section>
  );
};
