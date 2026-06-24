"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, formatPrice } from "@/shared";

import { useWalletAssets } from "../model";

const formatRate = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

export const HeldAssetsListSection = () => {
  const assets = useWalletAssets();

  return (
    <section className='mt-2'>
      <h2 className='mb-4 text-lg font-semibold text-text-dark'>보유자산 목록</h2>

      {assets.isLoading ? <p className='text-sm text-text-muted-dark'>보유 자산을 불러오는 중입니다.</p> : null}
      {!assets.isLoading && !assets.data?.length ? (
        <p className='text-sm text-text-muted-dark'>보유 중인 코인이 없습니다.</p>
      ) : null}

      {assets.data?.length ? (
        <Table className='w-full bg-surface-dark/20'>
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
              <TableRow key={asset.currency} className='border-b border-text-muted-dark/20'>
                <TableCell className='text-left text-white'>
                  <p className='font-semibold'>{asset.currency}</p>
                </TableCell>
                <TableCell className='text-right text-white'>{asset.balance.toLocaleString()}</TableCell>
                <TableCell className='text-right text-white'>{formatPrice(asset.averageBuyPrice)}</TableCell>
                <TableCell className='text-right text-white'>{formatPrice(asset.evaluatedPrice)}</TableCell>
                <TableCell className={`text-right ${asset.profitLoss >= 0 ? "text-increase" : "text-decrease"}`}>
                  {formatPrice(asset.profitLoss)} ({formatRate(asset.profitLossRate)}%)
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  );
};
