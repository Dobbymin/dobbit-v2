"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared";

import { useOrderbook } from "../model";

type OrderbookPanelProps = {
  marketCode: string;
};

export const OrderbookPanel = ({ marketCode }: OrderbookPanelProps) => {
  const { data, isLoading } = useOrderbook(marketCode);

  const units = data?.units ?? [];
  const top = units.slice(0, 15);
  const asks = [...top].reverse();
  const bids = top;
  const maxSize = Math.max(...top.flatMap((unit) => [unit.askSize, unit.bidSize]), 0);

  if (isLoading && units.length === 0) {
    return (
      <div className='flex h-full w-full items-center justify-center p-4 text-sm text-text-muted-dark'>
        호가 불러오는 중
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className='flex h-full w-full items-center justify-center p-4 text-sm text-text-muted-dark'>
        호가 정보가 없습니다.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className='border-b-3 border-text-dark/20'>
          <TableHead className='text-md py-4 text-center font-semibold text-text-dark' colSpan={3}>
            호가
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {asks.map((unit, index) => {
          const volumePercent = maxSize > 0 ? (unit.askSize / maxSize) * 100 : 0;
          return (
            <TableRow
              key={`ask-${unit.askPrice}-${index}`}
              className='border-b border-white bg-blue-100 text-sm hover:bg-blue-50'
            >
              <TableCell className='relative w-1/3 p-0'>
                <div className='absolute top-0 right-0 h-full bg-blue-200' style={{ width: `${volumePercent}%` }} />
                <div className='relative z-10 px-4 py-2 text-end font-roboto text-xs text-black'>
                  {unit.askSize.toLocaleString()}
                </div>
              </TableCell>
              <TableCell className='w-1/3 p-0'>
                <div className='px-4 py-2 text-center font-roboto font-semibold text-increase'>
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
              key={`bid-${unit.bidPrice}-${index}`}
              className='border-b border-white bg-red-100 text-sm hover:bg-red-50'
            >
              <TableCell className='w-1/3' />
              <TableCell className='w-1/3 p-0'>
                <div className='px-4 py-2 text-center font-roboto font-semibold text-decrease'>
                  {unit.bidPrice.toLocaleString()}
                </div>
              </TableCell>
              <TableCell className='relative w-1/3 p-0'>
                <div className='absolute top-0 left-0 h-full bg-red-200' style={{ width: `${volumePercent}%` }} />
                <div className='relative z-10 px-4 py-2 text-start font-roboto text-xs text-black'>
                  {unit.bidSize.toLocaleString()}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
