"use client";

import {
  ROUTES_PATH,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatPrice,
  useAuthStore,
} from "@/shared";
import dayjs from "dayjs";

import { useTradeHistory } from "../model";

export const TradeHistoryPanel = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: trades = [], isLoading } = useTradeHistory();

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
    <div className='flex-1 overflow-y-auto'>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-white/10'>
            <TableHead>체결시각</TableHead>
            <TableHead>마켓</TableHead>
            <TableHead>구분</TableHead>
            <TableHead className='text-right'>가격</TableHead>
            <TableHead className='text-right'>수량</TableHead>
            <TableHead className='text-right'>총액</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow className='border-b border-white/10' key={trade.id}>
              <TableCell className='text-xs text-muted-foreground' suppressHydrationWarning>
                {dayjs(trade.executedAt).format("MM.DD HH:mm")}
              </TableCell>
              <TableCell className='text-xs'>{trade.marketCode.replace("KRW-", "")}</TableCell>
              <TableCell className={trade.side === "BUY" ? "text-increase" : "text-decrease"}>
                {trade.side === "BUY" ? "매수" : "매도"}
              </TableCell>
              <TableCell className='text-right'>{formatPrice(trade.price)}</TableCell>
              <TableCell className='text-right'>
                {trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </TableCell>
              <TableCell className='text-right'>{formatPrice(trade.totalAmount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
