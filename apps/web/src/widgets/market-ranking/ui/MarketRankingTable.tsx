"use client";

import Link from "next/link";

import { FavoriteButton } from "@/features/favorite";
import { useOrderbook } from "@/features/market/model";

import { useState } from "react";

import { RANKING_TABS, getOrderbookRatio, useMarketRanking } from "../model";

import { RankingSummaryPanel } from "./RankingSummaryPanel";

const RankingRowsSkeleton = ({ isSummaryOpen }: { isSummaryOpen: boolean }) => (
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
        {!isSummaryOpen && (
          <td className='hidden lg:table-cell'>
            <div className='ml-auto h-3 w-14 rounded bg-surface-sunken' />
          </td>
        )}
        <td className='px-2'>
          <div className='h-2 rounded bg-surface-sunken' />
        </td>
      </tr>
    ))}
  </>
);

export const MarketRankingTable = () => {
  const { activeTab, isLoading, rows, setActiveTab } = useMarketRanking();
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [hoveredMarketCode, setHoveredMarketCode] = useState<string>();
  const orderbookQuery = useOrderbook(hoveredMarketCode);
  const selectedRow = rows.find((item) => item.marketCode === hoveredMarketCode) ?? rows[0];

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
        <button
          className='ml-auto shrink-0 rounded-md px-3 py-1 text-[13px] font-semibold text-subtle-foreground transition-colors hover:bg-surface-sunken hover:text-foreground'
          onClick={() => setIsSummaryOpen((value) => !value)}
          type='button'
        >
          {isSummaryOpen ? "요약 접기" : "요약 펼치기"}
        </button>
      </div>
      <div className={isSummaryOpen ? "flex" : undefined}>
        <div className='min-w-0 flex-1'>
          <table className='w-full table-fixed border-collapse text-[13px] font-semibold'>
            <colgroup>
              <col className='w-[44px]' />
              <col className='w-[44px]' />
              <col />
              <col className='w-[110px]' />
              <col className='w-[88px]' />
              <col className='hidden w-[96px] lg:table-column' />
              {!isSummaryOpen && <col className='hidden w-[84px] lg:table-column' />}
              <col className='w-[116px]' />
            </colgroup>
            <thead className='h-10 border-b border-border text-subtle-foreground'>
              <tr>
                <th className='px-3 text-left font-semibold whitespace-nowrap'>순위</th>
                <th className='text-center font-semibold'>관심</th>
                <th className='min-w-[120px] text-left font-semibold'>코인명</th>
                <th className='px-2 text-right font-semibold'>현재가</th>
                <th className='px-2 text-right font-semibold'>등락률</th>
                <th className='hidden px-3 text-right font-semibold lg:table-cell'>거래대금</th>
                {!isSummaryOpen && <th className='hidden px-3 text-right font-semibold lg:table-cell'>거래량</th>}
                <th className='px-2 text-center font-semibold'>매수/매도 비율</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <RankingRowsSkeleton isSummaryOpen={isSummaryOpen} />
              ) : (
                rows.map((item) => {
                  const isHovered = item.marketCode === hoveredMarketCode;
                  const ratio =
                    isHovered && orderbookQuery.data?.marketCode === item.marketCode
                      ? getOrderbookRatio(orderbookQuery.data.units)
                      : null;

                  return (
                    <tr
                      className='h-10 border-b border-border text-foreground transition-colors hover:bg-surface-sunken'
                      key={item.marketCode}
                      onMouseEnter={() => setHoveredMarketCode(item.marketCode)}
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
                      <td className='px-2 text-right'>
                        <Link
                          className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 tabular-nums ${item.changeBadgeClassName}`}
                          href={`/trade/${item.marketCode}`}
                        >
                          {item.formattedChangeRate}
                        </Link>
                      </td>
                      <td className='hidden truncate px-3 text-right tabular-nums lg:table-cell'>
                        <Link className='block truncate' href={`/trade/${item.marketCode}`}>
                          {item.formattedTradeAmount}
                        </Link>
                      </td>
                      {!isSummaryOpen && (
                        <td className='hidden truncate px-3 text-right tabular-nums lg:table-cell'>
                          {item.formattedTradeVolume}
                        </td>
                      )}
                      <td className='px-2'>
                        {ratio ? (
                          <div className='flex items-center gap-1 text-[11px] tabular-nums'>
                            <span className='text-increase'>{ratio.bidPercent}%</span>
                            <div className='flex h-2 min-w-0 flex-1 overflow-hidden rounded bg-surface-sunken'>
                              <span className='bg-increase' style={{ width: `${ratio.bidPercent}%` }} />
                              <span className='bg-decrease' style={{ width: `${ratio.askPercent}%` }} />
                            </div>
                            <span className='text-decrease'>{ratio.askPercent}%</span>
                          </div>
                        ) : (
                          <div className='h-2 rounded bg-surface-sunken' />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {isSummaryOpen && selectedRow && (
          <RankingSummaryPanel
            isOrderbookLoading={orderbookQuery.isLoading}
            orderbook={orderbookQuery.data}
            row={selectedRow}
          />
        )}
      </div>
    </section>
  );
};
