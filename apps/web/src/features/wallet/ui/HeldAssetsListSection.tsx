"use client";

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, formatPrice } from "@/shared";

import { useHeldAssets } from "../model";

const formatRate = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

export const HeldAssetsListSection = () => {
  const { data: assets, isLoading } = useHeldAssets();

  return (
    <section className='mt-2'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>보유자산 목록</h2>

      {isLoading ? (
        <div className='w-full overflow-x-auto'>
          <Table className='w-full min-w-[560px] bg-card/20'>
            <TableHeader>
              <TableRow className='border-b border-muted-foreground/20'>
                <TableHead className='text-center text-foreground'>보유자산</TableHead>
                <TableHead className='text-center text-foreground'>보유수량</TableHead>
                <TableHead className='text-center text-foreground'>매수금액</TableHead>
                <TableHead className='text-center text-foreground'>평가금액</TableHead>
                <TableHead className='text-center text-foreground'>평가손익(%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className='border-b border-muted-foreground/20'>
                  <TableCell className='text-left text-foreground'>
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-16' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    <Skeleton className='ml-auto h-4 w-16' />
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    <Skeleton className='ml-auto h-4 w-20' />
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    <Skeleton className='ml-auto h-4 w-20' />
                  </TableCell>
                  <TableCell className='text-right'>
                    <Skeleton className='ml-auto h-4 w-20' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !assets?.length ? (
        <div className='flex h-40 items-center justify-center bg-card/20'>
          <p className='text-sm text-muted-foreground'>보유 중인 코인이 없습니다.</p>
        </div>
      ) : null}

      {!isLoading && assets?.length ? (
        <div className='w-full overflow-x-auto'>
          <Table className='w-full min-w-[560px] bg-card/20'>
            <TableHeader>
              <TableRow className='border-b border-muted-foreground/20'>
                <TableHead className='text-center text-foreground'>보유자산</TableHead>
                <TableHead className='text-center text-foreground'>보유수량</TableHead>
                <TableHead className='text-center text-foreground'>매수금액</TableHead>
                <TableHead className='text-center text-foreground'>평가금액</TableHead>
                <TableHead className='text-center text-foreground'>평가손익(%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.symbol} className='border-b border-muted-foreground/20'>
                  <TableCell className='text-left text-foreground'>
                    <div>
                      <p className='font-semibold'>{asset.koreanName}</p>
                      <p className='text-xs text-muted-foreground'>{asset.symbolPair}</p>
                    </div>
                  </TableCell>
                  <TableCell className='text-right text-foreground'>{asset.quantity.toLocaleString()}</TableCell>
                  <TableCell className='text-right text-foreground'>{formatPrice(asset.totalCost)}</TableCell>
                  <TableCell className='text-right text-foreground'>{formatPrice(asset.liveEvaluatedAmount)}</TableCell>
                  <TableCell
                    className={`text-right ${asset.liveProfitAmount >= 0 ? "text-increase" : "text-decrease"}`}
                  >
                    {formatPrice(asset.liveProfitAmount)} ({formatRate(asset.liveProfitRate * 100)}%)
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  );
};
