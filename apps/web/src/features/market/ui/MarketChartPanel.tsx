"use client";

import dynamic from "next/dynamic";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Separator, Skeleton, cn, formatPrice } from "@/shared";
import type { CandleResponse, CurrentPrice, Market, MarketTickerUpdatedEvent } from "@dobbit/shared";
import { ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui";

import {
  CANDLE_INTERVALS,
  CHART_COLORS,
  DEFAULT_CANDLE_INTERVAL,
  calculateSMA,
  toCandleSeries,
  toLineSeries,
  toVolumeSeries,
  updateLastCandleWithTicker,
  updateLastLinePointWithTicker,
  useCandles,
  useMarketSocket,
} from "../model";
import type { CandleInterval } from "../model/libs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;

type MarketChartPanelProps = {
  market?: Market;
  selectedMarketCode: string;
  /** 상위에서 전달한 현재가. 목록과 공유하는 실시간 티커 또는 REST 응답. */
  ticker?: CurrentPrice | MarketTickerUpdatedEvent | null;
  isLoading: boolean;
};

type VolumeChartProps = {
  selectedMarketCode: string;
  selectedInterval: CandleInterval;
  candlesData: CandleResponse[];
  chartWidth: number | "100%";
};

const VolumeChart = ({ selectedMarketCode, selectedInterval, candlesData, chartWidth }: VolumeChartProps) => {
  const lastValidSelection = useRef<{ min: number; max: number } | null>(null);

  const volumeSeries = useMemo(
    () => [
      {
        name: "Volume",
        type: "bar",
        data: toVolumeSeries(candlesData),
      },
    ],
    [candlesData],
  );

  useEffect(() => {
    lastValidSelection.current = null;
  }, [selectedMarketCode, selectedInterval.type, selectedInterval.unit]);

  // 하단 차트를 brush(range selector)로 사용 — 캔들 차트("candles")를 타깃으로 줌/선택
  const volumeOptions = useMemo(() => {
    const points = toVolumeSeries(candlesData);
    const selectionMin = points.length > 0 ? points[Math.max(0, points.length - 30)]?.x.getTime() : undefined;
    const selectionMax = points.length > 0 ? points[points.length - 1]?.x.getTime() : undefined;

    return {
      chart: {
        type: "bar",
        id: "brush",
        brush: { enabled: true, target: "candles" },
        selection: {
          enabled: true,
          fill: { color: CHART_COLORS.brushFill, opacity: 0.4 },
          stroke: { color: CHART_COLORS.brushStroke },
          xaxis: { min: selectionMin, max: selectionMax },
        },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selection: (_chartContext: any, { xaxis }: any) => {
            if (xaxis?.min == null || xaxis?.max == null) return;

            if (xaxis.min !== xaxis.max) {
              lastValidSelection.current = { min: xaxis.min, max: xaxis.max };
              return;
            }

            const fallback =
              lastValidSelection.current ??
              (selectionMin !== undefined && selectionMax !== undefined
                ? { min: selectionMin, max: selectionMax }
                : null);

            if (!fallback) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apexChartsGlobal = (typeof window !== "undefined" && (window as any).ApexCharts) as any;
            if (apexChartsGlobal) {
              apexChartsGlobal.exec("candles", "updateOptions", {
                xaxis: { min: fallback.min, max: fallback.max },
              });
              apexChartsGlobal.exec("brush", "updateOptions", {
                chart: {
                  selection: {
                    enabled: true,
                    xaxis: { min: fallback.min, max: fallback.max },
                  },
                },
              });
            }
          },
        },
        toolbar: { show: false },
        background: "transparent",
      },
      theme: { mode: "dark" },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      grid: { show: false },
      plotOptions: {
        bar: {
          columnWidth: "100%",
          colors: {
            ranges: [{ from: 0, to: 1000000000, color: CHART_COLORS.volumeBar }],
          },
        },
      },
      xaxis: {
        type: "datetime" as const,
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: { show: false },
      },
    };
  }, [candlesData]);

  return (
    <div className='mt-2 h-[140px]'>
      <ApexCharts
        key={`${selectedMarketCode}-${selectedInterval.type}-${selectedInterval.unit ?? "none"}-brush`}
        options={volumeOptions}
        series={volumeSeries}
        type='bar'
        width={chartWidth}
        height='100%'
      />
    </div>
  );
};

const formatRate = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
};

const formatChangePrice = (value: number) => {
  if (value > 0) return `▲ ${formatPrice(value)}`;
  if (value < 0) return `▼ ${formatPrice(Math.abs(value))}`;
  return formatPrice(0);
};

const getDisplayCode = (marketCode: string) => {
  if (!marketCode.startsWith("KRW-")) {
    return marketCode;
  }
  return marketCode.replace("KRW-", "") + "/KRW";
};

export const MarketChartPanel = ({ market, selectedMarketCode, ticker, isLoading }: MarketChartPanelProps) => {
  // 상태 관리
  const [selectedInterval, setSelectedInterval] = useState<CandleInterval>(DEFAULT_CANDLE_INTERVAL);
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");
  const [indicators, setIndicators] = useState({ ma: false });
  const [chartWidth, setChartWidth] = useState<number | "100%">("100%");
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chartWrapper = chartWrapperRef.current;
    if (!chartWrapper) return;

    let animationFrameId: number | null = null;

    const updateChartWidth = () => {
      animationFrameId = null;
      const width = Math.round(chartWrapper.getBoundingClientRect().width);
      setChartWidth((previousWidth) => {
        const nextWidth = width > 0 ? width : "100%";
        return nextWidth === previousWidth ? previousWidth : nextWidth;
      });
    };

    const scheduleChartWidthUpdate = () => {
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(updateChartWidth);
      }
    };

    const resizeObserver = new ResizeObserver(scheduleChartWidthUpdate);

    resizeObserver.observe(chartWrapper);
    scheduleChartWidthUpdate();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // 캔들 데이터 로드
  const candlesQuery = useCandles(selectedMarketCode, selectedInterval);

  // 실시간 소켓 연결
  const { ticker: socketTicker } = useMarketSocket(selectedMarketCode);

  // 실시간 가격 우선: socket ticker > prop ticker
  const displayTicker = socketTicker || ticker;

  // 차트 시리즈 생성
  const series = useMemo(() => {
    if (!candlesQuery.data || candlesQuery.data.length === 0) {
      return [];
    }

    // 메인 시리즈: chartType에 따라 캔들 또는 라인
    let mainSeries: Array<{ x: Date; y: number | [number, number, number, number] }> = [];
    if (chartType === "candlestick") {
      mainSeries = toCandleSeries(candlesQuery.data);
      if (displayTicker) {
        mainSeries = updateLastCandleWithTicker(
          mainSeries as Array<{ x: Date; y: [number, number, number, number] }>,
          displayTicker.tradePrice,
        );
      }
    } else {
      mainSeries = toLineSeries(candlesQuery.data);
      if (displayTicker) {
        mainSeries = updateLastLinePointWithTicker(
          mainSeries as Array<{ x: Date; y: number }>,
          displayTicker.tradePrice,
        );
      }
    }

    return mainSeries;
  }, [candlesQuery.data, displayTicker, chartType]);

  const displayName = market?.koreanName ?? "-";
  const displayCode = market ? getDisplayCode(market.code) : "-";
  const displayPrice = displayTicker?.tradePrice;
  const signedChangeRate = displayTicker?.signedChangeRate ?? 0;
  const signedChangePrice = displayTicker?.signedChangePrice ?? 0;
  const changeTone =
    signedChangeRate > 0 ? "text-increase" : signedChangeRate < 0 ? "text-decrease" : "text-muted-foreground";

  // chartOptions는 chartType이 바뀔 때만 업데이트
  const chartOptions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: Record<string, any> = {
      chart: {
        type: chartType,
        id: "candles",
        toolbar: { autoSelected: "pan", show: false },
        zoom: { enabled: false },
        background: "transparent",
      },
      theme: { mode: "dark" },
      plotOptions: {
        candlestick: {
          colors: {
            upward: CHART_COLORS.candleUp,
            downward: CHART_COLORS.candleDown,
          },
        },
      },
      xaxis: {
        type: "datetime" as const,
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        tooltip: { enabled: true },
        labels: {
          formatter: (val: number) => formatPrice(val),
        },
      },
      grid: { borderColor: CHART_COLORS.grid },
    };
    return options;
  }, [chartType]);

  // MA 시리즈 계산 (indicators.ma = true일 때만)
  const maSeries = useMemo(() => {
    if (!indicators.ma || !candlesQuery.data || candlesQuery.data.length === 0) {
      return { ma7: null, ma20: null, ma60: null };
    }

    const closes = candlesQuery.data.map((candle) => candle.tradePrice);
    const ma7 = calculateSMA(closes, 7);
    const ma20 = calculateSMA(closes, 20);
    const ma60 = calculateSMA(closes, 60);

    return { ma7, ma20, ma60 };
  }, [indicators.ma, candlesQuery.data]);

  // chartSeries는 series, indicators, maSeries가 바뀔 때만 새 참조가 되도록 메모이즈
  const chartSeries = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seriesArray: Array<Record<string, any>> = [
      {
        name: chartType === "candlestick" ? "Candle" : "Price",
        type: chartType,
        data: series,
      },
    ];

    // MA 시리즈 추가
    if (indicators.ma && maSeries.ma7 && candlesQuery.data) {
      seriesArray.push({
        name: "MA7",
        type: "line",
        data: candlesQuery.data.map((candle, i) => ({
          x: new Date(candle.candleDateTime),
          y: maSeries.ma7?.[i] ?? null,
        })),
        stroke: {
          width: 1,
          colors: [CHART_COLORS.ma7],
        },
      });

      if (maSeries.ma20) {
        seriesArray.push({
          name: "MA20",
          type: "line",
          data: candlesQuery.data.map((candle, i) => ({
            x: new Date(candle.candleDateTime),
            y: maSeries.ma20?.[i] ?? null,
          })),
          stroke: {
            width: 1,
            colors: [CHART_COLORS.ma20],
          },
        });
      }

      if (maSeries.ma60) {
        seriesArray.push({
          name: "MA60",
          type: "line",
          data: candlesQuery.data.map((candle, i) => ({
            x: new Date(candle.candleDateTime),
            y: maSeries.ma60?.[i] ?? null,
          })),
          stroke: {
            width: 1,
            colors: [CHART_COLORS.ma60],
          },
        });
      }
    }

    return seriesArray;
  }, [series, indicators.ma, maSeries, candlesQuery.data, chartType]);

  return (
    <section className='bg-background flex min-h-[560px] shrink-0 flex-col'>
      <header className='border-border flex h-11 flex-nowrap items-center justify-between gap-3 overflow-x-auto border-b px-5'>
        <div className='min-w-0 shrink-0'>
          <h1 className='text-foreground truncate text-xl font-bold'>{displayName}</h1>
          <p className='text-muted-foreground mt-1 text-sm'>{displayCode}</p>
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
              {displayPrice != null ? `${formatPrice(displayPrice)} KRW` : "-"}
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

      <div className='border-border flex h-11 flex-nowrap items-center gap-2 overflow-x-auto border-b px-5'>
        {CANDLE_INTERVALS.map((interval) => (
          <Fragment key={`${interval.type}-${interval.unit ?? "none"}`}>
            <button
              onClick={() => setSelectedInterval(interval)}
              data-active={
                selectedInterval.type === interval.type && (selectedInterval.unit ?? 0) === (interval.unit ?? 0)
              }
              className='text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground h-7 shrink-0 whitespace-nowrap rounded px-2 text-xs font-medium transition-colors'
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
              className='text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 text-xs font-medium transition-colors'
              type='button'
            >
              차트설정
              <ChevronDown className='size-3.5' />
            </button>
          </PopoverTrigger>
          <PopoverContent className='w-40'>
            <div className='space-y-3'>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  type='radio'
                  name='chartType'
                  value='candlestick'
                  checked={chartType === "candlestick"}
                  onChange={(e) => setChartType(e.target.value as "candlestick" | "line")}
                />
                캔들
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  type='radio'
                  name='chartType'
                  value='line'
                  checked={chartType === "line"}
                  onChange={(e) => setChartType(e.target.value as "candlestick" | "line")}
                />
                라인
              </label>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className='text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 text-xs font-medium transition-colors'
              type='button'
            >
              지표
              <ChevronDown className='size-3.5' />
            </button>
          </PopoverTrigger>
          <PopoverContent className='w-40'>
            <div className='space-y-3'>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  checked={indicators.ma}
                  onChange={(e) => setIndicators({ ...indicators, ma: e.target.checked })}
                />
                이동평균선
              </label>
            </div>
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

          {candlesQuery.data && candlesQuery.data.length > 0 && (
            <VolumeChart
              selectedMarketCode={selectedMarketCode}
              selectedInterval={selectedInterval}
              candlesData={candlesQuery.data}
              chartWidth={chartWidth}
            />
          )}
        </div>
      </div>
    </section>
  );
};
