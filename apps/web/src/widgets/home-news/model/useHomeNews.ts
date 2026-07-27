"use client";

import { useMemo } from "react";

import { useHomeSummary } from "@/features";

import { toHomeNewsDisplayItems } from "./news-display";

export const useHomeNews = () => {
  const homeSummaryQuery = useHomeSummary();
  const news = useMemo(
    () => toHomeNewsDisplayItems(homeSummaryQuery.data?.news.slice(0, 6) ?? []),
    [homeSummaryQuery.data],
  );
  return { isLoading: homeSummaryQuery.isLoading, news };
};
