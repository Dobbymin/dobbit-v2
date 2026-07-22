"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMemo } from "react";

import { useFavorites } from "@/features/favorite";
import { useMarketTickers, useMarkets } from "@/features/market";
import { useIsAuth } from "@/shared/store";

export const FavoriteSidebar = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuth();
  const favoritesQuery = useFavorites();
  const marketsQuery = useMarkets({ quote: "KRW", onlyActive: true, enabled: isAuthenticated });
  const favoriteCodes = useMemo(() => [...(favoritesQuery.data ?? [])], [favoritesQuery.data]);
  const tickers = useMarketTickers(favoriteCodes);
  const marketsByCode = useMemo(
    () => new Map((marketsQuery.data ?? []).map((market) => [market.code, market])),
    [marketsQuery.data],
  );

  if (isAuthLoading) {
    return <aside className='hidden w-[370px] shrink-0 border-l border-border lg:flex' />;
  }

  return (
    <aside className='hidden h-[calc(100vh-52px)] w-[370px] shrink-0 flex-col border-l border-border bg-background lg:flex'>
      <div className='border-b border-border px-6 py-5'>
        <h2 className='text-lg font-semibold text-foreground'>관심</h2>
      </div>
      {!isAuthenticated ? (
        <div className='flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center'>
          <p className='text-sm text-subtle-foreground'>관심 코인을 담아보세요</p>
          <Link
            className='rounded-md bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken'
            href='/login'
          >
            로그인
          </Link>
        </div>
      ) : favoritesQuery.isLoading ? (
        <div className='flex flex-1 items-center justify-center px-6 text-center text-sm text-subtle-foreground'>
          관심 목록을 불러오는 중...
        </div>
      ) : favoriteCodes.length === 0 ? (
        <div className='flex flex-1 items-center justify-center px-6 text-center text-sm text-subtle-foreground'>
          관심 코인을 담아보세요
        </div>
      ) : (
        <div className='overflow-y-auto'>
          {favoriteCodes.map((code) => {
            const ticker = tickers[code];
            const signedChangeRate = ticker?.signedChangeRate ?? 0;
            const changeClassName =
              signedChangeRate > 0 ? "text-increase" : signedChangeRate < 0 ? "text-decrease" : "text-subtle-foreground";

            return (
              <button
                className='grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-border px-6 py-4 text-left transition-colors hover:bg-card'
                key={code}
                onClick={() => router.push(`/trade/${code}`)}
                type='button'
              >
                <span className='min-w-0'>
                  <span className='block truncate text-sm font-medium text-foreground'>
                    {marketsByCode.get(code)?.koreanName ?? code}
                  </span>
                  <span className='block truncate text-xs text-subtle-foreground'>{code}</span>
                </span>
                <span className='text-sm text-foreground'>
                  {ticker ? Number(ticker.tradePrice).toLocaleString("ko-KR") : "-"}
                </span>
                <span className={`text-sm ${changeClassName}`}>
                  {ticker ? `${signedChangeRate >= 0 ? "+" : ""}${(signedChangeRate * 100).toFixed(2)}%` : "-"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
};
