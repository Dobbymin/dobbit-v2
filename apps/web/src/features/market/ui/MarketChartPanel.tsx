"use client";

import dynamic from "next/dynamic";

import { useMemo } from "react";

import { formatPrice } from "@/shared";
import type { CurrentPrice, Market } from "@dobbit/shared";

import { toCandleSeries, updateLastCandleWithTicker, useCandles, useMarketSocket } from "../model";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

type MarketChartPanelProps = {
  market?: Market;
  selectedMarketCode: string;
  ticker?: CurrentPrice | null;
  isLoading: boolean;
};

const formatRate = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
};

const getDisplayCode = (marketCode: string) => {
  if (!marketCode.startsWith("KRW-")) {
    return marketCode;
  }
  return marketCode.replace("KRW-", "") + "/KRW";
};

export const MarketChartPanel = ({ market, selectedMarketCode, ticker, isLoading }: MarketChartPanelProps) => {
  // 캔들 데이터 로드
  const candlesQuery = useCandles(selectedMarketCode);

  // 실시간 소켓 연결
  const { ticker: socketTicker } = useMarketSocket(selectedMarketCode);

  // 실시간 가격 우선: socket ticker > prop ticker
  const displayTicker = socketTicker || ticker;

  // 차트 시리즈 생성
  const series = useMemo(() => {
    if (!candlesQuery.data || candlesQuery.data.length === 0) {
      return [];
    }

    let chartSeries = toCandleSeries(candlesQuery.data);

    // 실시간 가격으로 마지막 캔들 갱신
    if (displayTicker) {
      chartSeries = updateLastCandleWithTicker(chartSeries, displayTicker.tradePrice);
    }

    return chartSeries;
  }, [candlesQuery.data, displayTicker]);

  const displayName = market?.koreanName ?? "-";
  const displayCode = market ? getDisplayCode(market.code) : "-";
  const displayPrice = displayTicker?.tradePrice;
  const signedChangeRate = displayTicker?.signedChangeRate ?? 0;
  const changeTone = signedChangeRate > 0 ? "text-increase" : signedChangeRate < 0 ? "text-decrease" : "text-text-dark";

  const chartOptions = {
    chart: {
      type: "candlestick" as const,
      toolbar: {
        show: false,
      },
      background: "transparent",
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#dd3c44",
          downward: "#1375ec",
        },
      },
    },
    xaxis: {
      type: "datetime" as const,
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  const chartSeries = [
    {
      data: series,
    },
  ];

  return (
    <section className='flex min-h-[560px] flex-col bg-[#121212]'>
      <header className='flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-5 py-4'>
        <div className='min-w-0'>
          <h1 className='truncate text-xl font-semibold text-text-dark'>{displayName}</h1>
          <p className='mt-1 text-sm text-text-muted-dark'>{displayCode}</p>
        </div>
        <div className='text-right'>
          <p className='text-2xl font-semibold text-text-dark'>
            {displayPrice
              ? `${formatPrice(displayPrice)} KRW`
              : isLoading || candlesQuery.isLoading
                ? "불러오는 중"
                : "-"}
          </p>
          <p className={changeTone}>{formatRate(signedChangeRate)}</p>
        </div>
      </header>

      <div className='flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-2'>
        {["1초", "1분", "5분", "30분", "1시간", "주", "달", "년", "차트설정", "지표"].map((unit) => (
          <button
            className='h-7 rounded px-2 text-xs font-medium text-text-muted-dark transition-colors hover:bg-white/5 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white'
            data-active={unit === "1시간"}
            key={unit}
            type='button'
          >
            {unit}
          </button>
        ))}
      </div>

      <div className='min-h-0 flex-1 px-5 py-4'>
        {typeof window !== "undefined" && (
          <ApexCharts options={chartOptions} series={chartSeries} type='candlestick' height='100%' />
        )}
      </div>
    </section>
  );
};
