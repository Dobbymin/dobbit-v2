"use client";

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, formatPrice } from "@/shared";

import { useWalletAssets } from "../model";

const formatRate = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

export const HeldAssetsListSection = () => {
  const assets = useWalletAssets();

  return (
    <section className='mt-2'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>보유자산 목록</h2>

      {assets.isLoading ? (
        <Table className='w-full bg-card/20'>
          <TableHeader>
            <TableRow className='border-b border-text-muted-dark/20'>
              <TableHead className='text-center text-white'>보유자산</TableHead>
              <TableHead className='text-center text-white'>보유수량</TableHead>
              <TableHead className='text-center text-white'>매수금액</TableHead>
              <TableHead className='text-center text-white'>평가금액</TableHead>
              <TableHead className='text-center text-white'>평가손익(%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i} className='border-b border-text-muted-dark/20'>
                <TableCell className='text-left text-white'>
                  <Skeleton className='h-4 w-12' />
                </TableCell>
                <TableCell className='text-right text-white'>
                  <Skeleton className='ml-auto h-4 w-16' />
                </TableCell>
                <TableCell className='text-right text-white'>
                  <Skeleton className='ml-auto h-4 w-20' />
                </TableCell>
                <TableCell className='text-right text-white'>
                  <Skeleton className='ml-auto h-4 w-20' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='ml-auto h-4 w-20' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : !assets.data?.length ? (
        <p className='text-sm text-muted-foreground'>보유 중인 코인이 없습니다.</p>
      ) : null}

      {!assets.isLoading && assets.data?.length ? (
        <Table className='w-full bg-card/20'>
          <TableHeader>
            <TableRow className='border-b border-text-muted-dark/20'>
              <TableHead className='text-center text-white'>보유자산</TableHead>
              <TableHead className='text-center text-white'>보유수량</TableHead>
              <TableHead className='text-center text-white'>매수금액</TableHead>
              <TableHead className='text-center text-white'>평가금액</TableHead>
              <TableHead className='text-center text-white'>평가손익(%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.data.map((asset) => (
              <TableRow key={asset.symbol} className='border-b border-text-muted-dark/20'>
                <TableCell className='text-left text-white'>
                  <p className='font-semibold'>{asset.symbol}</p>
                </TableCell>
                <TableCell className='text-right text-white'>{asset.quantity.toLocaleString()}</TableCell>
                <TableCell className='text-right text-white'>{formatPrice(asset.totalCost)}</TableCell>
                <TableCell className='text-right text-white'>{formatPrice(asset.evaluatedAmount)}</TableCell>
                <TableCell className={`text-right ${asset.profitAmount >= 0 ? "text-increase" : "text-decrease"}`}>
                  {formatPrice(asset.profitAmount)} ({formatRate(asset.profitRate * 100)}%)
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  );
};
