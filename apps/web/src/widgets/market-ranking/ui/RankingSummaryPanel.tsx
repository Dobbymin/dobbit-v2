"use client";

import dynamic from "next/dynamic";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getNewsApi } from "@/features/news/api";
import { toCandleSeries, useCandles } from "@/features/market/model";
import { CHART_COLORS } from "@/features/market/model/libs/chart-colors";
import { Skeleton, formatCoinPrice } from "@/shared";
import type { OrderbookResponse } from "@dobbit/shared";

import type { RankingDisplayRow } from "../model";
import { getChangeBadgeClassName } from "../model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;

type RankingSummaryPanelProps = {
  row: RankingDisplayRow;
  orderbook?: OrderbookResponse | null;
  isOrderbookLoading: boolean;
};

export const RankingSummaryPanel = ({ row, orderbook, isOrderbookLoading }: RankingSummaryPanelProps) => {
  const candlesQuery = useCandles(row.marketCode, { label: "일", type: "days" });
  const newsQuery = useQuery({
    queryKey: ["news", "list", { marketCode: row.marketCode, limit: 3 }],
    queryFn: () => getNewsApi({ marketCode: row.marketCode, limit: 3 }),
    staleTime: 30_000,
  });
  const candleSeries = useMemo(
    () => [{ name: row.koreanName, data: toCandleSeries(candlesQuery.data ?? []) }],
    [candlesQuery.data, row.koreanName],
  );
  const orderbookData = orderbook?.marketCode === row.marketCode ? orderbook : null;
  const bestOrderbookUnit = orderbookData?.units[0];

  return (
    <aside className='hidden w-[320px] shrink-0 border-l border-border lg:block'>
      <div className='space-y-5 p-4'>
        <header>
          <div className='flex items-center justify-between gap-2'>
            <div className='min-w-0'>
              <h3 className='truncate font-bold text-foreground'>{row.koreanName}</h3>
              <p className='text-xs text-subtle-foreground'>{row.marketCode.replace("KRW-", "")}</p>
            </div>
            <span
              className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs tabular-nums ${getChangeBadgeClassName(row.signedChangeRate)}`}
            >
              {row.formattedChangeRate}
            </span>
          </div>
          <p className={`mt-2 text-xl font-bold tabular-nums ${row.changeClassName}`}>
            {formatCoinPrice(row.tradePrice)} KRW
          </p>
        </header>

        <section>
          <h4 className='mb-2 text-sm font-semibold text-foreground'>일봉 차트</h4>
          {candlesQuery.isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            <ApexCharts
              key={row.marketCode}
              options={{
                chart: { toolbar: { show: false } },
                grid: { show: false },
                legend: { show: false },
                plotOptions: {
                  candlestick: { colors: { upward: CHART_COLORS.candleUp, downward: CHART_COLORS.candleDown } },
                },
                xaxis: { type: "datetime", labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
                yaxis: { labels: { show: false } },
              }}
              series={candleSeries}
              type='candlestick'
              height={160}
              width='100%'
            />
          )}
        </section>

        <section>
          <h4 className='mb-2 text-sm font-semibold text-foreground'>호가 요약</h4>
          {isOrderbookLoading ? (
            <Skeleton className='h-12 w-full' />
          ) : orderbookData && bestOrderbookUnit ? (
            <div className='space-y-1 text-xs tabular-nums'>
              <div className='flex justify-between text-decrease'>
                <span>최우선 매도</span>
                <span>{formatCoinPrice(bestOrderbookUnit.askPrice)} · {bestOrderbookUnit.askSize.toLocaleString("ko-KR")}</span>
              </div>
              <div className='flex justify-between text-increase'>
                <span>최우선 매수</span>
                <span>{formatCoinPrice(bestOrderbookUnit.bidPrice)} · {bestOrderbookUnit.bidSize.toLocaleString("ko-KR")}</span>
              </div>
            </div>
          ) : (
            <p className='text-xs text-subtle-foreground'>호가 정보가 없습니다.</p>
          )}
        </section>

        <section>
          <h4 className='mb-2 text-sm font-semibold text-foreground'>최신 뉴스</h4>
          {newsQuery.isLoading ? (
            <Skeleton className='h-16 w-full' />
          ) : newsQuery.data?.length ? (
            <ul className='space-y-2'>
              {newsQuery.data.map((news) => (
                <li className='min-w-0' key={news.id}>
                  <p className='truncate text-xs font-medium text-foreground'>{news.title}</p>
                  <p className='mt-0.5 text-[11px] text-subtle-foreground'>
                    {news.source} · {new Date(news.publishedAt).toLocaleString("ko-KR")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-xs text-subtle-foreground'>최신 뉴스가 없습니다.</p>
          )}
        </section>
      </div>
    </aside>
  );
};
