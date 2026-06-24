"use client";

import dynamic from "next/dynamic";

import { useMemo, useState } from "react";

import { formatPrice } from "@/shared";
import type { CandleResponse, CurrentPrice, Market } from "@dobbit/shared";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui";

import {
  CANDLE_INTERVALS,
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
  ticker?: CurrentPrice | null;
  isLoading: boolean;
};

type VolumeChartProps = {
  selectedMarketCode: string;
  selectedInterval: CandleInterval;
  candlesData: CandleResponse[];
};

const VolumeChart = ({ selectedMarketCode, selectedInterval, candlesData }: VolumeChartProps) => {
  const volumeOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
        background: "transparent",
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: false,
      },
      plotOptions: {
        bar: {
          colors: {
            ranges: [
              {
                from: -Number.MAX_VALUE,
                to: 0,
                color: "#999999",
              },
              {
                from: 0,
                to: Number.MAX_VALUE,
                color: "#999999",
              },
            ],
          },
          columnWidth: "70%",
        },
      },
      xaxis: {
        type: "datetime" as const,
      },
      yaxis: {
        labels: {
          show: false,
        },
        tooltip: {
          enabled: true,
        },
      },
    }),
    [],
  );

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

  return (
    <div className='mt-2 h-[120px]'>
      <ApexCharts
        key={`${selectedMarketCode}-${selectedInterval.type}-${selectedInterval.unit ?? "none"}-volume`}
        options={volumeOptions}
        series={volumeSeries}
        type='bar'
        height='100%'
      />
    </div>
  );
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
  // 상태 관리
  const [selectedInterval, setSelectedInterval] = useState<CandleInterval>(DEFAULT_CANDLE_INTERVAL);
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");
  const [indicators, setIndicators] = useState({ ma: false });

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
  const changeTone = signedChangeRate > 0 ? "text-increase" : signedChangeRate < 0 ? "text-decrease" : "text-text-dark";

  // chartOptions는 chartType이 바뀔 때만 업데이트
  const chartOptions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: Record<string, any> = {
      chart: {
        type: chartType,
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
          colors: ["#FFA500"],
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
            colors: ["#4169E1"],
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
            colors: ["#DC143C"],
          },
        });
      }
    }

    return seriesArray;
  }, [series, indicators.ma, maSeries, candlesQuery.data, chartType]);

  return (
    <section className='flex min-h-[560px] flex-col bg-[#121212]'>
      <header className='flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-5 py-4'>
        <div className='min-w-0'>
          <h1 className='truncate text-xl font-bold text-text-dark'>{displayName}</h1>
          <p className='mt-1 text-sm text-text-muted-dark'>{displayCode}</p>
        </div>
        <div className='text-right'>
          <p className={`text-2xl font-semibold ${displayPrice ? changeTone : "text-text-dark"}`}>
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
        {CANDLE_INTERVALS.map((interval) => (
          <button
            key={`${interval.type}-${interval.unit ?? "none"}`}
            onClick={() => setSelectedInterval(interval)}
            data-active={
              selectedInterval.type === interval.type && (selectedInterval.unit ?? 0) === (interval.unit ?? 0)
            }
            className='h-7 rounded px-2 text-xs font-medium text-text-muted-dark transition-colors hover:bg-white/5 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white'
            type='button'
          >
            {interval.label}
          </button>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <button
              className='h-7 rounded px-2 text-xs font-medium text-text-muted-dark transition-colors hover:bg-white/5 hover:text-white'
              type='button'
            >
              지표
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

        <Popover>
          <PopoverTrigger asChild>
            <button
              className='h-7 rounded px-2 text-xs font-medium text-text-muted-dark transition-colors hover:bg-white/5 hover:text-white'
              type='button'
            >
              차트설정
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
      </div>

      <div className='min-h-0 flex-1 px-5 py-4'>
        <div className='flex h-full flex-col'>
          <div className='min-h-0 flex-1'>
            <ApexCharts
              key={`${selectedMarketCode}-${selectedInterval.type}-${selectedInterval.unit ?? "none"}-main`}
              options={chartOptions}
              series={chartSeries}
              type={chartType}
              height='100%'
            />
          </div>

          {candlesQuery.data && candlesQuery.data.length > 0 && (
            <VolumeChart
              selectedMarketCode={selectedMarketCode}
              selectedInterval={selectedInterval}
              candlesData={candlesQuery.data}
            />
          )}
        </div>
      </div>
    </section>
  );
};
