"use client";

import dynamic from "next/dynamic";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getNewsApi } from "@/features/news/api";
import { toCandleSeries, toVolumeSeries, useCandles } from "@/features/market/model";
import { CHART_COLORS } from "@/features/market/model/libs/chart-colors";
import { Skeleton, formatCoinPrice } from "@/shared";
import type { OrderbookResponse } from "@dobbit/shared";

import type { RankingDisplayRow } from "../model";
import { getChangeBadgeClassName } from "../model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;
const SUMMARY_CANDLE_COUNT = 90;

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
  const recentCandles = useMemo(
    () => (candlesQuery.data ?? []).slice(-SUMMARY_CANDLE_COUNT),
    [candlesQuery.data],
  );
  const axisLabels = useMemo(() => {
    if (recentCandles.length === 0) return [];
    const pick = [
      recentCandles[0],
      recentCandles[Math.floor(recentCandles.length / 2)],
      recentCandles[recentCandles.length - 1],
    ];
    return pick.map((candle) => {
      const date = new Date(candle!.candleDateTime);
      return `${String(date.getFullYear()).slice(2)}년 ${date.getMonth() + 1}월`;
    });
  }, [recentCandles]);
  const candleSeries = useMemo(
    () => [{ name: row.koreanName, data: toCandleSeries(recentCandles) }],
    [recentCandles, row.koreanName],
  );
  const volumeSeries = useMemo(
    () => [{ name: "거래량", data: toVolumeSeries(recentCandles) }],
    [recentCandles],
  );
  const candleChartOptions = useMemo(
    () => ({
      chart: {
        type: "candlestick",
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
        animations: { enabled: false },
        parentHeightOffset: 0,
      },
      theme: { mode: "dark" },
      grid: {
        show: true,
        borderColor: CHART_COLORS.grid,
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 2, right: 2, top: 0, bottom: 0 },
      },
      plotOptions: {
        candlestick: {
          colors: { upward: CHART_COLORS.candleUp, downward: CHART_COLORS.candleDown },
          wick: { useFillColor: true },
        },
        bar: { columnWidth: "50%" },
      },
      xaxis: {
        type: "datetime",
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        crosshairs: { show: false },
      },
      yaxis: { labels: { show: false }, tickAmount: 3 },
    }),
    [],
  );
  const volumeChartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
        animations: { enabled: false },
        parentHeightOffset: 0,
      },
      theme: { mode: "dark" },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      grid: { show: false, padding: { left: 2, right: 2, top: 0, bottom: 0 } },
      plotOptions: {
        bar: {
          columnWidth: "60%",
          colors: {
            ranges: [{ from: 0, to: Number.MAX_SAFE_INTEGER, color: CHART_COLORS.volumeBar }],
          },
        },
      },
      xaxis: {
        type: "datetime",
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        crosshairs: { show: false },
        labels: { show: false },
      },
      yaxis: { labels: { show: false }, max: (max: number) => max },
      tooltip: { enabled: false },
    }),
    [],
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
          <p className='mb-1 text-[11px] text-subtle-foreground'>일봉</p>
          {candlesQuery.isLoading ? (
            <Skeleton className='h-[188px] w-full' />
          ) : recentCandles.length ? (
            <div>
              <ApexCharts
                key={`${row.marketCode}-candles`}
                options={candleChartOptions}
                series={candleSeries}
                type='candlestick'
                height={140}
                width='100%'
              />
              {/* ApexCharts가 플롯 상단에 고정 30px 오프셋을 잡아 캔들과 거래량 사이가 벌어진다. 음수 마진으로 상쇄한다. */}
              <div className='-mt-[30px]'>
                <ApexCharts
                  key={`${row.marketCode}-volume`}
                  options={volumeChartOptions}
                  series={volumeSeries}
                  type='bar'
                  height={86}
                  width='100%'
                />
              </div>
              <div className='-mt-[24px] flex justify-between px-1 text-[11px] text-subtle-foreground'>
                {axisLabels.map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
              </div>
            </div>
          ) : (
            <p className='text-xs text-subtle-foreground'>차트 데이터가 없습니다.</p>
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
