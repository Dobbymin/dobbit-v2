"use client";

import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui";
import { formatPrice } from "@/shared/libs/format";

import { useWalletAssets } from "../model";

const formatRate = (value: number) => `${value.toFixed(2)}%`;

export const HeldAssetsListSection = () => {
  const assets = useWalletAssets();

  return (
    <section className='rounded-lg border bg-card p-5'>
      <div className='mb-4'>
        <h2 className='text-base font-semibold'>보유 자산</h2>
      </div>
      {assets.isLoading ? <p className='text-sm text-muted-foreground'>보유 자산을 불러오는 중입니다.</p> : null}
      {!assets.isLoading && !assets.data?.length ? (
        <p className='text-sm text-muted-foreground'>보유 중인 코인이 없습니다.</p>
      ) : null}
      {assets.data?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>자산</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>평단가</TableHead>
              <TableHead>평가금액</TableHead>
              <TableHead>손익</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.data.map((asset) => (
              <TableRow key={asset.currency}>
                <TableCell>{asset.currency}</TableCell>
                <TableCell>{asset.balance.toLocaleString()}</TableCell>
                <TableCell>{formatPrice(asset.averageBuyPrice)}</TableCell>
                <TableCell>{formatPrice(asset.evaluatedPrice)}</TableCell>
                <TableCell>
                  <Badge variant={asset.profitLoss >= 0 ? "default" : "destructive"}>
                    {formatPrice(asset.profitLoss)} ({formatRate(asset.profitLossRate)})
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  );
};
