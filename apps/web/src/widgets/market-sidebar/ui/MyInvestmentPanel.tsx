"use client";

import Link from "next/link";

import { Button, ROUTES_PATH, cn, formatPrice, useIsAuth } from "@/shared";
import { useHeldAssets, useWalletSummary } from "@/features/wallet";
import { Wallet } from "lucide-react";

import { CoinIcon } from "@/entities/market";

type MyInvestmentPanelProps = {
  selectedMarketCode: string;
};

const toneOf = (value: number) =>
  value > 0 ? "text-increase" : value < 0 ? "text-decrease" : "text-change-neutral";

const withSign = (value: number) => (value >= 0 ? "+" : "");

export const MyInvestmentPanel = ({ selectedMarketCode }: MyInvestmentPanelProps) => {
  const { isAuthenticated } = useIsAuth();
  const summary = useWalletSummary();
  const heldAssets = useHeldAssets();

  if (!isAuthenticated) {
    return (
      <section className='flex min-h-0 flex-1 flex-col'>
        <header className='px-4 py-3'>
          <h2 className='text-sm font-semibold text-foreground'>내 투자</h2>
        </header>
        <div className='flex flex-col items-center gap-3 px-4 py-10 text-center'>
          <Wallet aria-hidden='true' className='text-subtle-foreground' size={24} />
          <p className='text-sm text-muted-foreground'>로그인하고 내 투자를 확인하세요.</p>
          <Button asChild size='sm'>
            <Link href={ROUTES_PATH.LOGIN}>로그인</Link>
          </Button>
        </div>
      </section>
    );
  }

  const data = summary.data;

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <header className='px-4 py-3'>
        <h2 className='text-sm font-semibold text-foreground'>내 투자</h2>
      </header>
      <div className='flex-1 overflow-y-auto'>
        <div className='border-y border-border px-4 py-4'>
          <p className='text-xs text-muted-foreground'>총 자산</p>
          <p className='text-xl font-bold text-foreground tabular-nums'>{data ? formatPrice(data.totalAssetAmount) : "-"}원</p>
          {data ? (
            <p className={cn("text-sm font-medium tabular-nums", toneOf(data.totalProfitAmount))}>
              {withSign(data.totalProfitAmount)}
              {formatPrice(data.totalProfitAmount)}원 ({withSign(data.totalProfitRate)}
              {(data.totalProfitRate * 100).toFixed(2)}%)
            </p>
          ) : null}
          <div className='mt-3 flex items-center justify-between rounded-lg bg-surface-sunken px-3 py-2'>
            <span className='text-xs text-muted-foreground'>원화</span>
            <span className='text-sm font-medium text-foreground tabular-nums'>{data ? formatPrice(data.cashAmount) : "-"}원</span>
          </div>
        </div>
        {heldAssets.data.length === 0 ? (
          <p className='px-4 py-8 text-sm text-muted-foreground'>보유 중인 코인이 없어요.</p>
        ) : (
          heldAssets.data.map((asset) => {
            const active = asset.marketCode === selectedMarketCode;
            return (
              <Link
                className={cn(
                  "grid h-[56px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-l-2 px-4 transition-colors",
                  active ? "border-l-primary bg-surface-sunken" : "border-l-transparent hover:bg-card",
                )}
                href={`/trade/${asset.marketCode}`}
                key={asset.marketCode}
              >
                <CoinIcon marketCode={asset.marketCode} size={28} />
                <span className='min-w-0'>
                  <span className={cn("line-clamp-1 text-sm font-semibold", active ? "text-primary" : "text-foreground")}>
                    {asset.koreanName}
                  </span>
                  <span className='block text-[11px] text-muted-foreground'>{asset.symbol}</span>
                </span>
                <span className='flex flex-col items-end'>
                  <span className='text-xs font-medium text-foreground tabular-nums'>{formatPrice(asset.liveEvaluatedAmount)}원</span>
                  <span className={cn("text-xs tabular-nums", toneOf(asset.liveProfitAmount))}>
                    {withSign(asset.liveProfitRate)}
                    {(asset.liveProfitRate * 100).toFixed(2)}%
                  </span>
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};
