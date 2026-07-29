"use client";

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, formatCoinPrice, formatPrice } from "@/shared";

import { useWalletInvestmentSummary } from "../model";

const COLORS = ["#8fa96f", "#a3d9a5", "#e0e0e0", "#5b8def", "#dd3c44", "#f0a868"];

type StatItemProps = {
  label: string;
  value: string;
  unit: string;
  tone?: "increase" | "decrease";
};

const StatItem = ({ label, value, unit, tone }: StatItemProps) => {
  const valueClassName = tone === "increase" ? "text-increase" : tone === "decrease" ? "text-decrease" : "text-foreground";

  return (
    <div className='flex w-full items-center justify-between'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <div className='flex items-end gap-1'>
        <span className={`text-base font-bold tabular-nums sm:text-lg ${valueClassName}`}>{value}</span>
        <span className='text-xs font-bold text-muted-foreground'>{unit}</span>
      </div>
    </div>
  );
};

const formatRate = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
const formatSignedPrice = (value: number) => `${value >= 0 ? "+" : ""}${formatPrice(value)}`;

const SummarySkeleton = () => (
  <div className='grid grid-cols-1 gap-4 bg-card/20 p-4 sm:grid-cols-2 lg:grid-cols-4'>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className='flex w-full items-center justify-between'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-5 w-24' />
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className='w-full overflow-x-auto'>
    <Table className='w-full min-w-[720px] bg-card/20'>
      <TableHeader>
        <TableRow className='border-b border-muted-foreground/20'>
          <TableHead className='text-left text-foreground'>자산</TableHead>
          <TableHead className='text-right text-foreground'>보유수량</TableHead>
          <TableHead className='text-right text-foreground'>평균 매수가</TableHead>
          <TableHead className='text-right text-foreground'>현재가</TableHead>
          <TableHead className='text-right text-foreground'>매수금액</TableHead>
          <TableHead className='text-right text-foreground'>평가금액</TableHead>
          <TableHead className='text-right text-foreground'>평가손익(%)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 4 }).map((_, index) => (
          <TableRow key={index} className='border-b border-muted-foreground/20'>
            <TableCell className='text-left'>
              <div className='space-y-1'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-3 w-20' />
              </div>
            </TableCell>
            {Array.from({ length: 6 }).map((_, cellIndex) => (
              <TableCell key={cellIndex} className='text-right'>
                <Skeleton className='ml-auto h-4 w-20' />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const AllocationSkeleton = () => (
  <div className='space-y-4 bg-card/20 p-4'>
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-4 w-12' />
        </div>
        <Skeleton className='h-2 w-full rounded-full' />
      </div>
    ))}
  </div>
);

export const InvestmentProfitSection = () => {
  const summary = useWalletInvestmentSummary();
  const { assets, allocation, totalEvaluatedAmount, totalProfitAmount, totalProfitRate, totalPurchaseAmount } = summary.data;
  const profitTone = totalProfitAmount >= 0 ? "increase" : "decrease";
  const rateTone = totalProfitRate >= 0 ? "increase" : "decrease";

  return (
    <section className='mt-2 space-y-8'>
      <div>
        <h2 className='mb-4 text-lg font-semibold text-foreground'>투자손익 요약</h2>
        {summary.isLoading ? (
          <SummarySkeleton />
        ) : (
          <div className='grid grid-cols-1 gap-4 bg-card/20 p-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatItem label='총 매수금액' value={formatPrice(totalPurchaseAmount)} unit='KRW' />
            <StatItem label='총 평가금액' value={formatPrice(totalEvaluatedAmount)} unit='KRW' />
            <StatItem label='총 평가손익' value={formatSignedPrice(totalProfitAmount)} unit='KRW' tone={profitTone} />
            <StatItem label='총 평가수익률' value={formatRate(totalProfitRate * 100)} unit='%' tone={rateTone} />
          </div>
        )}
      </div>

      <div>
        <h2 className='mb-4 text-lg font-semibold text-foreground'>자산별 손익</h2>
        {summary.isLoading ? (
          <TableSkeleton />
        ) : !assets.length ? (
          <div className='flex h-40 items-center justify-center bg-card/20'>
            <p className='text-sm text-muted-foreground'>보유 중인 코인이 없습니다.</p>
          </div>
        ) : (
          <div className='w-full overflow-x-auto'>
            <Table className='w-full min-w-[720px] bg-card/20'>
              <TableHeader>
                <TableRow className='border-b border-muted-foreground/20'>
                  <TableHead className='text-left text-foreground'>자산</TableHead>
                  <TableHead className='text-right text-foreground'>보유수량</TableHead>
                  <TableHead className='text-right text-foreground'>평균 매수가</TableHead>
                  <TableHead className='text-right text-foreground'>현재가</TableHead>
                  <TableHead className='text-right text-foreground'>매수금액</TableHead>
                  <TableHead className='text-right text-foreground'>평가금액</TableHead>
                  <TableHead className='text-right text-foreground'>평가손익(%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.marketCode} className='border-b border-muted-foreground/20'>
                    <TableCell className='text-left text-foreground'>
                      <div>
                        <p className='font-semibold'>{asset.koreanName}</p>
                        <p className='text-xs text-muted-foreground'>{asset.symbolPair}</p>
                      </div>
                    </TableCell>
                    <TableCell className='text-right text-foreground'>
                      {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    </TableCell>
                    <TableCell className='text-right text-foreground'>{formatCoinPrice(asset.averagePrice)}</TableCell>
                    <TableCell className='text-right text-foreground'>{formatCoinPrice(asset.livePrice)}</TableCell>
                    <TableCell className='text-right text-foreground'>{formatPrice(asset.totalCost)}</TableCell>
                    <TableCell className='text-right text-foreground'>{formatPrice(asset.liveEvaluatedAmount)}</TableCell>
                    <TableCell
                      className={`text-right ${asset.liveProfitAmount >= 0 ? "text-increase" : "text-decrease"}`}
                    >
                      {formatSignedPrice(asset.liveProfitAmount)} ({formatRate(asset.liveProfitRate * 100)}%)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div>
        <h2 className='mb-4 text-lg font-semibold text-foreground'>자산 비중</h2>
        {summary.isLoading ? (
          <AllocationSkeleton />
        ) : !assets.length ? (
          <div className='flex h-40 items-center justify-center bg-card/20'>
            <p className='text-sm text-muted-foreground'>보유 중인 코인이 없습니다.</p>
          </div>
        ) : (
          <div className='space-y-4 bg-card/20 p-4'>
            {allocation.map(({ asset, percentage }, index) => {
              const color = COLORS[index % COLORS.length];
              const percentageText = `${(percentage * 100).toFixed(2)}%`;

              return (
                <div key={asset.marketCode} className='space-y-2'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='flex min-w-0 items-center gap-2 text-sm text-foreground'>
                      <span className='inline-block size-2 shrink-0 rounded-full' style={{ background: color }} />
                      <span className='truncate'>{asset.koreanName}</span>
                      <span className='text-xs text-muted-foreground'>{asset.symbolPair}</span>
                    </div>
                    <span className='shrink-0 text-sm tabular-nums text-muted-foreground'>{percentageText}</span>
                  </div>
                  <div className='h-2 w-full rounded-full bg-muted-foreground/15'>
                    <div className='h-full rounded-full' style={{ width: percentageText, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
