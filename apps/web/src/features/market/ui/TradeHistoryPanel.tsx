"use client";

import { useMemo } from "react";

import {
  ROUTES_PATH,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatCoinPrice,
  formatPrice,
  useAuthStore,
} from "@/shared";
import dayjs from "dayjs";

import { useMarkets, useTradeHistory } from "../model";

export const TradeHistoryPanel = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: trades = [], isLoading } = useTradeHistory();
  const { data: markets = [] } = useMarkets({ quote: "KRW", onlyActive: true });

  const marketMap = useMemo(
    () =>
      new Map(
        markets.map((market) => [`KRW-${market.symbol}`, { koreanName: market.koreanName, symbol: market.symbol }]),
      ),
    [markets],
  );

  if (!accessToken) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground'>
        <p>로그인하면 개인 거래내역을 볼 수 있습니다.</p>
        <a className='font-semibold text-primary hover:underline' href={ROUTES_PATH.LOGIN}>
          로그인하기
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3 p-5'>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className='h-8 w-full' key={`trade-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground'>
        거래내역이 없습니다.
      </div>
    );
  }

  return (
    <div className='min-h-0 flex-1 overflow-y-auto'>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-border'>
            <TableHead>체결시각</TableHead>
            <TableHead>마켓</TableHead>
            <TableHead>구분</TableHead>
            <TableHead className='text-right'>가격</TableHead>
            <TableHead className='text-right'>수량</TableHead>
            <TableHead className='text-right'>총액</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const marketInfo = marketMap.get(trade.marketCode);
            const koreanName = marketInfo?.koreanName || trade.marketCode.replace("KRW-", "");
            const symbol = marketInfo?.symbol || trade.marketCode.replace("KRW-", "");

            return (
              <TableRow className='border-b border-border' key={trade.id}>
                <TableCell className='text-xs text-muted-foreground' suppressHydrationWarning>
                  {dayjs(trade.executedAt).format("MM.DD HH:mm")}
                </TableCell>
                <TableCell className='text-xs'>
                  <div>
                    <p className='font-semibold text-foreground'>{koreanName}</p>
                    <p className='text-muted-foreground'>{symbol}/KRW</p>
                  </div>
                </TableCell>
                <TableCell className={trade.side === "BUY" ? "text-increase" : "text-decrease"}>
                  {trade.side === "BUY" ? "매수" : "매도"}
                </TableCell>
                <TableCell className='text-right'>{formatCoinPrice(trade.price)}</TableCell>
                <TableCell className='text-right'>
                  {trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </TableCell>
                <TableCell className='text-right'>{formatPrice(trade.totalAmount)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
