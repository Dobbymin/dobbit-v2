"use client";

import { type RefCallback, useCallback, useEffect, useState } from "react";

import { useIntersectionObserver } from "@/shared";

import type { NewsListItem, NewsListQuery } from "../api";

import { useNews } from "./useNews";

const INITIAL_COUNT = 10;
const STEP = 10;

type UseNewsListResult = {
  isLoading: boolean;
  newsItems: NewsListItem[];
  observerRef: RefCallback<HTMLDivElement>;
  visibleCount: number;
  visibleItems: NewsListItem[];
};

export const useNewsList = (query?: NewsListQuery): UseNewsListResult => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const news = useNews({ ...query, limit: 100 });
  const newsItems = news.data ?? [];

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [query?.marketCode, query?.offset, query?.page, query?.provider, query?.sentiment]);

  const loadMore = useCallback(() => {
    if (visibleCount < newsItems.length) setVisibleCount((previous) => previous + STEP);
  }, [newsItems.length, visibleCount]);
  const observerRef = useIntersectionObserver(loadMore);

  return {
    isLoading: news.isLoading,
    newsItems,
    observerRef,
    visibleItems: newsItems.slice(0, visibleCount),
    visibleCount,
  };
};
