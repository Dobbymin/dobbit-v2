"use client";

import Link from "next/link";

import { FavoriteButton } from "@/features/favorite";

import { RANKING_TABS, useMarketRanking } from "../model";

const RankingRowsSkeleton = () => (
  <>
    {Array.from({ length: 20 }, (_, index) => (
      <tr className='h-10 border-b border-border' key={index}>
        <td className='px-3'>
          <div className='h-3 w-4 rounded bg-surface-sunken' />
        </td>
        <td>
          <div className='mx-auto size-5 rounded bg-surface-sunken' />
        </td>
        <td>
          <div className='h-3 w-24 rounded bg-surface-sunken' />
        </td>
        <td>
          <div className='ml-auto h-3 w-16 rounded bg-surface-sunken' />
        </td>
        <td>
          <div className='ml-auto h-3 w-12 rounded bg-surface-sunken' />
        </td>
        <td className='hidden lg:table-cell'>
          <div className='ml-auto h-3 w-14 rounded bg-surface-sunken' />
        </td>
      </tr>
    ))}
  </>
);

export const MarketRankingTable = () => {
  const { activeTab, isLoading, rows, setActiveTab } = useMarketRanking();

  return (
    <section className='w-full overflow-hidden rounded-lg border border-border bg-card'>
      <div className='flex h-12 items-center gap-1 overflow-hidden border-b border-border px-3'>
        {RANKING_TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              className={`h-8 shrink-0 rounded-md px-3 text-[13px] font-semibold transition-colors ${
                isActive
                  ? "bg-surface-sunken text-foreground"
                  : "text-subtle-foreground hover:bg-surface-sunken hover:text-foreground"
              }`}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              type='button'
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <table className='w-full table-fixed border-collapse text-[13px] font-semibold'>
        <colgroup>
          <col className='w-11' />
          <col className='w-11' />
          <col />
          <col className='w-[22%] sm:w-[18%]' />
          <col className='w-[18%] sm:w-[14%]' />
          <col className='hidden lg:table-column lg:w-[15%]' />
        </colgroup>
        <thead className='h-10 border-b border-border text-subtle-foreground'>
          <tr>
            <th className='px-3 text-left font-semibold whitespace-nowrap'>순위</th>
            <th className='text-center font-semibold'>관심</th>
            <th className='text-left font-semibold'>코인명</th>
            <th className='px-2 text-right font-semibold'>현재가</th>
            <th className='px-2 text-right font-semibold'>등락률</th>
            <th className='hidden px-3 text-right font-semibold lg:table-cell'>거래대금</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <RankingRowsSkeleton />
          ) : (
            rows.map((item) => {
              return (
                <tr
                  className='h-10 border-b border-border text-foreground transition-colors hover:bg-surface-sunken'
                  key={item.marketCode}
                >
                  <td className='px-3 text-subtle-foreground'>
                    <Link className='block' href={`/trade/${item.marketCode}`}>
                      {item.rank}
                    </Link>
                  </td>
                  <td className='text-center'>
                    <FavoriteButton marketCode={item.marketCode} />
                  </td>
                  <td className='min-w-0'>
                    <Link className='flex min-w-0 items-center gap-1' href={`/trade/${item.marketCode}`}>
                      <span className='min-w-0 truncate'>{item.koreanName}</span>
                      <span className='shrink-0 text-[11px] font-medium text-subtle-foreground'>
                        {item.marketCode.replace("KRW-", "")}
                      </span>
                    </Link>
                  </td>
                  <td className='truncate px-2 text-right tabular-nums'>
                    <Link className='block truncate' href={`/trade/${item.marketCode}`}>
                      {item.formattedTradePrice}
                    </Link>
                  </td>
                  <td className={`truncate px-2 text-right tabular-nums ${item.changeClassName}`}>
                    <Link className='block truncate' href={`/trade/${item.marketCode}`}>
                      {item.formattedChangeRate}
                    </Link>
                  </td>
                  <td className='hidden truncate px-3 text-right tabular-nums lg:table-cell'>
                    <Link className='block truncate' href={`/trade/${item.marketCode}`}>
                      {item.formattedTradeAmount}
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </section>
  );
};
