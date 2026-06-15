"use client";

import { useQuery } from "@tanstack/react-query";

import { type NewsListQuery, getNewsApi } from "../api";

import { newsKeys } from "./news-query-keys";

export const useNews = (query?: NewsListQuery) => {
  return useQuery({
    queryKey: newsKeys.list(query),
    queryFn: () => getNewsApi(query),
    staleTime: 30_000,
  });
};
