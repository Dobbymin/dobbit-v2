"use client";

import dynamic from "next/dynamic";

import { Fragment, useCallback, useEffect, useMemo, useRef } from "react";

import { Separator, Skeleton, cn, formatCoinPrice, formatPrice } from "@/shared";
import type { CandleResponse, CurrentPrice, Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui";

import {
  CANDLE_INTERVALS,
  createChartOptions,
  createChartSeries,
  createVolumeChartOptions,
  createVolumeSeries,
  getBrushSelection,
  useCandles,
  useMarketChart,
  useMarketSocket,
} from "../model";
import type { CandleInterval } from "../model/libs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;
const EMPTY_CANDLES: CandleResponse[] = [];

type MarketChartPanelProps = {
  market?: Market;
  selectedMarketCode: string;
  ticker?: CurrentPrice | MarketTickerUpdatedEvent | null;
  isLoading: boolean;
};

type VolumeChartProps = {
  selectedMarketCode: string;
  selectedInterval: CandleInterval;
  candles: CandleResponse[];
  chartWidth: number | "100%";
};

const VolumeChart = ({ selectedMarketCode, selectedInterval, candles, chartWidth }: VolumeChartProps) => {
  const lastSelection = useRef<{ min: number; max: number } | null>(null);
  const timestamps = useMemo(() => candles.map((candle) => new Date(candle.candleDateTime)), [candles]);
  const volumeSeries = useMemo(() => createVolumeSeries(candles), [candles]);
  const resetSelection = `${selectedMarketCode}-${selectedInterval.type}-${selectedInterval.unit ?? "none"}`;

  useEffect(() => {
    lastSelection.current = null;
  }, [resetSelection]);

  const selectBrush = useCallback(
    ({ min, max }: { min: number; max: number }) => {
      if (min !== max) {
        lastSelection.current = { min, max };
        return;
      }

      const fallback = lastSelection.current ?? getBrushSelection(timestamps);
      if (!fallback || typeof window === "undefined") return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apexCharts = (window as any).ApexCharts;
      apexCharts?.exec("candles", "updateOptions", { xaxis: fallback });
      apexCharts?.exec("brush", "updateOptions", {
        chart: { selection: { enabled: true, xaxis: fallback } },
      });
    },
    [timestamps],
  );
  const volumeOptions = useMemo(() => createVolumeChartOptions(timestamps, selectBrush), [selectBrush, timestamps]);

  return (
    <div className='mt-2 h-[140px]'>
      <ApexCharts
        key={`${resetSelection}-brush`}
        options={volumeOptions}
        series={volumeSeries}
        type='bar'
        width={chartWidth}
        height='100%'
      />
    </div>
  );
};

const formatRate = (value: number) => `${value > 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;
const formatChangePrice = (value: number) =>
  value > 0 ? `▲ ${formatPrice(value)}` : value < 0 ? `▼ ${formatPrice(Math.abs(value))}` : formatPrice(0);
const getDisplayCode = (marketCode: string) =>
  marketCode.startsWith("KRW-") ? `${marketCode.replace("KRW-", "")}/KRW` : marketCode;

export const MarketChartPanel = ({ market, selectedMarketCode, ticker, isLoading }: MarketChartPanelProps) => {
  const {
    chartWrapperRef,
    chartWidth,
    selectedInterval,
    chartType,
    showMovingAverages,
    selectInterval,
    selectChartType,
    setMovingAveragesVisible,
  } = useMarketChart();
  const candlesQuery = useCandles(selectedMarketCode, selectedInterval);
  const { ticker: socketTicker } = useMarketSocket(selectedMarketCode);
  const displayTicker = socketTicker || ticker;
  const candles = candlesQuery.data ?? EMPTY_CANDLES;
  const chartOptions = useMemo(() => createChartOptions(chartType), [chartType]);
  const chartSeries = useMemo(
    () => createChartSeries(candles, chartType, displayTicker, showMovingAverages),
    [candles, chartType, displayTicker, showMovingAverages],
  );
  const displayPrice = displayTicker?.tradePrice;
  const signedChangeRate = displayTicker?.signedChangeRate ?? 0;
  const signedChangePrice = displayTicker?.signedChangePrice ?? 0;
  const changeTone =
    signedChangeRate > 0 ? "text-increase" : signedChangeRate < 0 ? "text-decrease" : "text-muted-foreground";
  const handleChartTypeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    selectChartType(event.target.value as typeof chartType);
  const handleMovingAverageChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setMovingAveragesVisible(event.target.checked);

  return (
    <section className='flex min-h-[560px] shrink-0 flex-col bg-background'>
      <header className='flex flex-nowrap items-start justify-between gap-3 border-b border-border px-5 py-4'>
        <div className='min-w-0'>
          <h1 className='truncate text-xl font-bold text-foreground'>{market?.koreanName ?? "-"}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>{market ? getDisplayCode(market.code) : "-"}</p>
        </div>
        <div className='shrink-0 text-right'>
          {displayPrice == null && (isLoading || candlesQuery.isLoading) ? (
            <Skeleton className='ml-auto h-8 w-40' />
          ) : (
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                displayPrice != null ? changeTone : "text-foreground",
              )}
            >
              {displayPrice != null ? `${formatCoinPrice(displayPrice)} KRW` : "-"}
            </p>
          )}
          <div className={cn("flex justify-end gap-3 text-sm tabular-nums", changeTone)}>
            {displayPrice != null ? (
              <>
                <span>{formatRate(signedChangeRate)}</span>
                <span>{formatChangePrice(signedChangePrice)}</span>
              </>
            ) : isLoading || candlesQuery.isLoading ? (
              <Skeleton className='h-5 w-24' />
            ) : (
              <span>-</span>
            )}
          </div>
        </div>
      </header>
      <div className='flex h-11 flex-nowrap items-center gap-2 overflow-x-auto border-b border-border px-5'>
        {CANDLE_INTERVALS.map((interval) => (
          <Fragment key={`${interval.type}-${interval.unit ?? "none"}`}>
            <button
              onClick={() => selectInterval(interval)}
              data-active={
                selectedInterval.type === interval.type && (selectedInterval.unit ?? 0) === (interval.unit ?? 0)
              }
              className='h-7 shrink-0 rounded px-2 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground'
              type='button'
            >
              {interval.label}
            </button>
            {interval.type === "minutes" && interval.unit === 60 && (
              <Separator orientation='vertical' className='shrink-0 data-[orientation=vertical]:h-4' />
            )}
          </Fragment>
        ))}
        <Separator orientation='vertical' className='shrink-0 data-[orientation=vertical]:h-4' />
        <Popover>
          <PopoverTrigger asChild>
            <button
              className='flex h-7 shrink-0 items-center gap-1 rounded px-2 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              type='button'
            >
              차트설정
              <ChevronDown className='size-3.5' />
            </button>
          </PopoverTrigger>
          <PopoverContent className='w-40'>
            <div className='space-y-3'>
              {(["candlestick", "line"] as const).map((type) => (
                <label key={type} className='flex items-center gap-2 text-sm'>
                  <input
                    type='radio'
                    name='chartType'
                    value={type}
                    checked={chartType === type}
                    onChange={handleChartTypeChange}
                  />
                  {type === "candlestick" ? "캔들" : "라인"}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className='flex h-7 shrink-0 items-center gap-1 rounded px-2 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              type='button'
            >
              지표
              <ChevronDown className='size-3.5' />
            </button>
          </PopoverTrigger>
          <PopoverContent className='w-40'>
            <label className='flex items-center gap-2 text-sm'>
              <input type='checkbox' checked={showMovingAverages} onChange={handleMovingAverageChange} />
              이동평균선
            </label>
          </PopoverContent>
        </Popover>
      </div>
      <div className='min-h-0 flex-1 px-5 py-4'>
        <div ref={chartWrapperRef} className='flex h-full flex-col overflow-hidden'>
          <div className='min-h-0 flex-1'>
            {(isLoading || candlesQuery.isLoading) && !candlesQuery.data ? (
              <Skeleton className='h-full w-full' />
            ) : (
              <ApexCharts
                key={`${selectedMarketCode}-${selectedInterval.type}-${selectedInterval.unit ?? "none"}-main`}
                options={chartOptions}
                series={chartSeries}
                type={chartType}
                width={chartWidth}
                height='100%'
              />
            )}
          </div>
          {candles.length > 0 && (
            <VolumeChart
              selectedMarketCode={selectedMarketCode}
              selectedInterval={selectedInterval}
              candles={candles}
              chartWidth={chartWidth}
            />
          )}
        </div>
      </div>
    </section>
  );
};
