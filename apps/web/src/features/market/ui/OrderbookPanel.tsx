"use client";

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, cn, formatCoinPrice } from "@/shared";

import { useOrderbookPanel } from "../model";

type OrderbookPanelProps = {
  marketCode: string;
  onSelectPrice?: (price: number) => void;
};

export const OrderbookPanel = ({ marketCode, onSelectPrice }: OrderbookPanelProps) => {
  const { asks, bids, isEmpty, isLoading } = useOrderbookPanel(marketCode);

  const isSelectable = Boolean(onSelectPrice);

  if (isLoading && isEmpty) {
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

  if (isEmpty) {
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
        {asks.map((row, index) => {
          return (
            <TableRow
              className={cn(
                "border-b border-border/40 transition-colors hover:bg-muted/40",
                isSelectable && "cursor-pointer",
              )}
              key={`ask-${row.price}-${index}`}
              onClick={isSelectable ? () => onSelectPrice?.(row.price) : undefined}
            >
              <TableCell className='relative w-1/3 p-0'>
                {/* 매도 잔량 막대: 하락(파랑) 계열을 저채도 알파로 */}
                <div
                  className='absolute top-0 right-0 h-full bg-decrease/15'
                  style={{ width: `${row.volumePercent}%` }}
                />
                <div className='relative z-10 px-4 py-2 text-end font-mono text-xs text-muted-foreground tabular-nums'>
                  {row.size.toLocaleString("ko-KR", { maximumFractionDigits: 4 })}
                </div>
              </TableCell>
              <TableCell className='w-1/3 p-0'>
                <div className='px-4 py-2 text-center font-mono text-sm font-semibold text-decrease tabular-nums'>
                  {formatCoinPrice(row.price)}
                </div>
              </TableCell>
              <TableCell className='w-1/3' />
            </TableRow>
          );
        })}

        {bids.map((row, index) => {
          return (
            <TableRow
              className={cn(
                "border-b border-border/40 transition-colors hover:bg-muted/40",
                isSelectable && "cursor-pointer",
              )}
              key={`bid-${row.price}-${index}`}
              onClick={isSelectable ? () => onSelectPrice?.(row.price) : undefined}
            >
              <TableCell className='w-1/3' />
              <TableCell className='w-1/3 p-0'>
                <div className='px-4 py-2 text-center font-mono text-sm font-semibold text-increase tabular-nums'>
                  {formatCoinPrice(row.price)}
                </div>
              </TableCell>
              <TableCell className='relative w-1/3 p-0'>
                {/* 매수 잔량 막대: 상승(빨강) 계열을 저채도 알파로 */}
                <div
                  className='absolute top-0 left-0 h-full bg-increase/15'
                  style={{ width: `${row.volumePercent}%` }}
                />
                <div className='relative z-10 px-4 py-2 text-start font-mono text-xs text-muted-foreground tabular-nums'>
                  {row.size.toLocaleString("ko-KR", { maximumFractionDigits: 4 })}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
