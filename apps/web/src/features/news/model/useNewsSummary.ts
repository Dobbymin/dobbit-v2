"use client";

import { useMemo } from "react";

import { getNewsSummary } from "./libs";
import { useNews } from "./useNews";

export const useNewsSummary = () => {
  const news = useNews({ limit: 100 });
  const summary = useMemo(() => getNewsSummary(news.data ?? []), [news.data]);

  return { isLoading: news.isLoading, summary };
};
