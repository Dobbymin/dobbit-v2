"use client";

import { useMemo } from "react";

import { toTradeHistoryRows, useMarkets, useTradeHistory } from "@/features/market/model";
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared";

export const TradeHistorySection = () => {
  const { data: trades = [], isLoading: isTradesLoading } = useTradeHistory();
  const { data: markets = [], isLoading: isMarketsLoading } = useMarkets({ quote: "KRW", onlyActive: true });
  const rows = useMemo(() => toTradeHistoryRows(trades, markets), [markets, trades]);
  const isLoading = isTradesLoading || isMarketsLoading;

  return (
    <section className='mt-2'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>거래 내역</h2>

      {isLoading ? (
        <div className='w-full overflow-x-auto'>
          <Table className='w-full min-w-[640px] bg-card/20'>
            <TableHeader>
              <TableRow className='border-b border-muted-foreground/20'>
                <TableHead className='text-center text-foreground'>체결시각</TableHead>
                <TableHead className='text-center text-foreground'>마켓</TableHead>
                <TableHead className='text-center text-foreground'>구분</TableHead>
                <TableHead className='text-center text-foreground'>체결가</TableHead>
                <TableHead className='text-center text-foreground'>수량</TableHead>
                <TableHead className='text-center text-foreground'>거래금액</TableHead>
                <TableHead className='text-center text-foreground'>수수료</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className='border-b border-muted-foreground/20'>
                  <TableCell className='text-center text-foreground'>
                    <Skeleton className='mx-auto h-4 w-28' />
                  </TableCell>
                  <TableCell className='text-left text-foreground'>
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-16' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </TableCell>
                  <TableCell className='text-center text-foreground'>
                    <Skeleton className='mx-auto h-4 w-10' />
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    <Skeleton className='ml-auto h-4 w-20' />
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    <Skeleton className='ml-auto h-4 w-16' />
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    <Skeleton className='ml-auto h-4 w-20' />
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    <Skeleton className='ml-auto h-4 w-16' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !rows.length ? (
        <div className='flex h-40 items-center justify-center bg-card/20'>
          <p className='text-sm text-muted-foreground'>거래 내역이 없습니다.</p>
        </div>
      ) : (
        <div className='w-full overflow-x-auto'>
          <Table className='w-full min-w-[640px] bg-card/20'>
            <TableHeader>
              <TableRow className='border-b border-muted-foreground/20'>
                <TableHead className='text-center text-foreground'>체결시각</TableHead>
                <TableHead className='text-center text-foreground'>마켓</TableHead>
                <TableHead className='text-center text-foreground'>구분</TableHead>
                <TableHead className='text-right text-foreground'>체결가</TableHead>
                <TableHead className='text-right text-foreground'>수량</TableHead>
                <TableHead className='text-right text-foreground'>거래금액</TableHead>
                <TableHead className='text-right text-foreground'>수수료</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className='border-b border-muted-foreground/20'>
                  <TableCell className='text-center text-foreground' suppressHydrationWarning>
                    {row.executedAtFull}
                  </TableCell>
                  <TableCell className='text-left text-foreground'>
                    <div>
                      <p className='font-semibold'>{row.koreanName}</p>
                      <p className='text-xs text-muted-foreground'>{row.symbolPair}</p>
                    </div>
                  </TableCell>
                  <TableCell className={row.sideTone === "increase" ? "text-increase" : "text-decrease"}>
                    {row.sideLabel}
                  </TableCell>
                  <TableCell className='text-right text-foreground'>{row.price}</TableCell>
                  <TableCell className='text-right text-foreground'>{row.quantity}</TableCell>
                  <TableCell className='text-right text-foreground'>{row.totalAmount}</TableCell>
                  <TableCell className='text-right text-foreground'>{row.fee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
};
