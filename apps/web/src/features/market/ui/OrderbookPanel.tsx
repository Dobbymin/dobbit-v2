"use client";

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn } from "@/shared";

import { useOrderbook } from "../model";

type OrderbookPanelProps = {
  marketCode: string;
  onSelectPrice?: (price: number) => void;
};

const ROW_COUNT = 15;

export const OrderbookPanel = ({ marketCode, onSelectPrice }: OrderbookPanelProps) => {
  const { data, isLoading } = useOrderbook(marketCode);

  const isSelectable = Boolean(onSelectPrice);

  const units = data?.units ?? [];
  const top = units.slice(0, ROW_COUNT);
  const asks = [...top].reverse();
  const bids = top;
  const maxSize = Math.max(...top.flatMap((unit) => [unit.askSize, unit.bidSize]), 0);

  if (isLoading && units.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow className='border-border border-b'>
            <TableHead className='text-muted-foreground py-3 text-center text-xs font-medium' colSpan={3}>
              호가
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow className='border-border/50 border-b' key={`orderbook-skeleton-${index}`}>
              <TableCell className='w-1/3 px-4 py-2'>
                <Skeleton className='ml-auto h-3 w-12' />
              </TableCell>
              <TableCell className='w-1/3 px-4 py-2'>
                <Skeleton className='mx-auto h-3 w-20' />
              </TableCell>
              <TableCell className='w-1/3 px-4 py-2'>
                <Skeleton className='h-3 w-12' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (units.length === 0) {
    return (
      <div className='text-muted-foreground flex h-full w-full items-center justify-center p-4 text-sm'>
        호가 정보가 없습니다.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className='border-border border-b'>
          <TableHead className='text-muted-foreground py-3 text-center text-xs font-medium' colSpan={3}>
            호가
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {asks.map((unit, index) => {
          const volumePercent = maxSize > 0 ? (unit.askSize / maxSize) * 100 : 0;

          return (
            <TableRow
              className={cn(
                "border-border/40 hover:bg-muted/40 border-b transition-colors",
                isSelectable && "cursor-pointer",
              )}
              key={`ask-${unit.askPrice}-${index}`}
              onClick={isSelectable ? () => onSelectPrice?.(unit.askPrice) : undefined}
            >
              <TableCell className='relative w-1/3 p-0'>
                {/* 매도 잔량 막대: 하락(파랑) 계열을 저채도 알파로 */}
                <div
                  className='bg-decrease/15 absolute top-0 right-0 h-full'
                  style={{ width: `${volumePercent}%` }}
                />
                <div className='text-muted-foreground relative z-10 px-4 py-2 text-end font-mono text-xs tabular-nums'>
                  {unit.askSize.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </div>
              </TableCell>
              <TableCell className='w-1/3 p-0'>
                <div className='text-decrease px-4 py-2 text-center font-mono text-sm font-semibold tabular-nums'>
                  {unit.askPrice.toLocaleString()}
                </div>
              </TableCell>
              <TableCell className='w-1/3' />
            </TableRow>
          );
        })}

        {bids.map((unit, index) => {
          const volumePercent = maxSize > 0 ? (unit.bidSize / maxSize) * 100 : 0;

          return (
            <TableRow
              className={cn(
                "border-border/40 hover:bg-muted/40 border-b transition-colors",
                isSelectable && "cursor-pointer",
              )}
              key={`bid-${unit.bidPrice}-${index}`}
              onClick={isSelectable ? () => onSelectPrice?.(unit.bidPrice) : undefined}
            >
              <TableCell className='w-1/3' />
              <TableCell className='w-1/3 p-0'>
                <div className='text-increase px-4 py-2 text-center font-mono text-sm font-semibold tabular-nums'>
                  {unit.bidPrice.toLocaleString()}
                </div>
              </TableCell>
              <TableCell className='relative w-1/3 p-0'>
                {/* 매수 잔량 막대: 상승(빨강) 계열을 저채도 알파로 */}
                <div
                  className='bg-increase/15 absolute top-0 left-0 h-full'
                  style={{ width: `${volumePercent}%` }}
                />
                <div className='text-muted-foreground relative z-10 px-4 py-2 text-start font-mono text-xs tabular-nums'>
                  {unit.bidSize.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
