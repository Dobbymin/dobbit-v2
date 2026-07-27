"use client";

import { useEffect, useRef, useState } from "react";

import { DEFAULT_CANDLE_INTERVAL } from "./libs";
import type { CandleInterval, ChartType } from "./libs";

export const useMarketChart = () => {
  const [selectedInterval, setSelectedInterval] = useState<CandleInterval>(DEFAULT_CANDLE_INTERVAL);
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [showMovingAverages, setShowMovingAverages] = useState(false);
  const [chartWidth, setChartWidth] = useState<number | "100%">("100%");
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = chartWrapperRef.current;
    if (!element) return;

    let animationFrameId: number | null = null;
    const updateWidth = () => {
      animationFrameId = null;
      const nextWidth = Math.round(element.getBoundingClientRect().width) || "100%";
      setChartWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
    };
    const scheduleWidthUpdate = () => {
      if (animationFrameId === null) animationFrameId = requestAnimationFrame(updateWidth);
    };
    const observer = new ResizeObserver(scheduleWidthUpdate);
    observer.observe(element);
    scheduleWidthUpdate();

    return () => {
      observer.disconnect();
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return {
    chartWrapperRef,
    chartWidth,
    selectedInterval,
    chartType,
    showMovingAverages,
    selectInterval: setSelectedInterval,
    selectChartType: setChartType,
    setMovingAveragesVisible: setShowMovingAverages,
  };
};
