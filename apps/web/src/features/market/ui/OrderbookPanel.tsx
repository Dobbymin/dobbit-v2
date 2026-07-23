"use client";

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn, formatCoinPrice } from "@/shared";

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
          <TableRow className='border-b border-border'>
            <TableHead className='py-3 text-center text-xs font-medium text-muted-foreground' colSpan={3}>
              호가
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow className='border-b border-border/50' key={`orderbook-skeleton-${index}`}>
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
      <div className='flex h-full w-full items-center justify-center p-4 text-sm text-muted-foreground'>
        호가 정보가 없습니다.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className='border-b border-border'>
          <TableHead className='py-3 text-center text-xs font-medium text-muted-foreground' colSpan={3}>
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
                "border-b border-border/40 transition-colors hover:bg-muted/40",
                isSelectable && "cursor-pointer",
              )}
              key={`ask-${unit.askPrice}-${index}`}
              onClick={isSelectable ? () => onSelectPrice?.(unit.askPrice) : undefined}
            >
              <TableCell className='relative w-1/3 p-0'>
                {/* 매도 잔량 막대: 하락(파랑) 계열을 저채도 알파로 */}
                <div className='absolute top-0 right-0 h-full bg-decrease/15' style={{ width: `${volumePercent}%` }} />
                <div className='relative z-10 px-4 py-2 text-end font-mono text-xs text-muted-foreground tabular-nums'>
                  {unit.askSize.toLocaleString("ko-KR", { maximumFractionDigits: 4 })}
                </div>
              </TableCell>
              <TableCell className='w-1/3 p-0'>
                <div className='px-4 py-2 text-center font-mono text-sm font-semibold text-decrease tabular-nums'>
                  {formatCoinPrice(unit.askPrice)}
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
                "border-b border-border/40 transition-colors hover:bg-muted/40",
                isSelectable && "cursor-pointer",
              )}
              key={`bid-${unit.bidPrice}-${index}`}
              onClick={isSelectable ? () => onSelectPrice?.(unit.bidPrice) : undefined}
            >
              <TableCell className='w-1/3' />
              <TableCell className='w-1/3 p-0'>
                <div className='px-4 py-2 text-center font-mono text-sm font-semibold text-increase tabular-nums'>
                  {formatCoinPrice(unit.bidPrice)}
                </div>
              </TableCell>
              <TableCell className='relative w-1/3 p-0'>
                {/* 매수 잔량 막대: 상승(빨강) 계열을 저채도 알파로 */}
                <div className='absolute top-0 left-0 h-full bg-increase/15' style={{ width: `${volumePercent}%` }} />
                <div className='relative z-10 px-4 py-2 text-start font-mono text-xs text-muted-foreground tabular-nums'>
                  {unit.bidSize.toLocaleString("ko-KR", { maximumFractionDigits: 4 })}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
