"use client";

import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, formatPrice } from "@/shared";

import { useWalletCashHistory } from "../model";

const formatDate = (value: string) =>
  new Date(value)
    .toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
    .replace(/\. /g, ".")
    .replace(/(\d{2})\.(\d{2}:\d{2})$/, "$1 $2");

export const CashHistorySection = () => {
  const { data, isLoading } = useWalletCashHistory();
  const items = data?.items;

  return (
    <section className='mt-2'>
      <h2 className='mb-4 text-lg font-semibold text-foreground'>입출금 내역</h2>

      {isLoading ? (
        <div className='w-full overflow-x-auto'>
          <Table className='w-full min-w-[480px] bg-card/20'>
            <TableHeader>
              <TableRow className='border-b border-muted-foreground/20'>
                <TableHead className='text-center text-foreground'>일시</TableHead>
                <TableHead className='text-center text-foreground'>구분</TableHead>
                <TableHead className='text-center text-foreground'>금액</TableHead>
                <TableHead className='text-center text-foreground'>내용</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className='border-b border-muted-foreground/20'>
                  <TableCell className='text-center text-foreground'>
                    <Skeleton className='mx-auto h-4 w-28' />
                  </TableCell>
                  <TableCell className='text-center text-foreground'>
                    <Skeleton className='mx-auto h-4 w-10' />
                  </TableCell>
                  <TableCell className='text-right text-foreground'>
                    <Skeleton className='ml-auto h-4 w-20' />
                  </TableCell>
                  <TableCell className='text-left text-foreground'>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !items?.length ? (
        <div className='flex h-40 items-center justify-center bg-card/20'>
          <p className='text-sm text-muted-foreground'>입출금 내역이 없습니다.</p>
        </div>
      ) : null}

      {!isLoading && items?.length ? (
        <div className='w-full overflow-x-auto'>
          <Table className='w-full min-w-[480px] bg-card/20'>
            <TableHeader>
              <TableRow className='border-b border-muted-foreground/20'>
                <TableHead className='text-center text-foreground'>일시</TableHead>
                <TableHead className='text-center text-foreground'>구분</TableHead>
                <TableHead className='text-center text-foreground'>금액</TableHead>
                <TableHead className='text-center text-foreground'>내용</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isDeposit = item.type === "DEPOSIT";

                return (
                  <TableRow key={item.id} className='border-b border-muted-foreground/20'>
                    <TableCell className='text-center text-foreground'>{formatDate(item.createdAt)}</TableCell>
                    <TableCell className={`text-center ${isDeposit ? "text-increase" : "text-decrease"}`}>
                      {isDeposit ? "입금" : "출금"}
                    </TableCell>
                    <TableCell className={`text-right ${isDeposit ? "text-increase" : "text-decrease"}`}>
                      {isDeposit ? "+" : "-"}
                      {formatPrice(item.amount)}
                    </TableCell>
                    <TableCell className='text-left text-foreground'>{item.reason ?? "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  );
};
