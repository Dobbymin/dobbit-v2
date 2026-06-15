"use client";

import { useQuery } from "@tanstack/react-query";

import { getNewsApi, type NewsListQuery } from "../api";

import { newsKeys } from "./news-query-keys";

export const useNews = (query?: NewsListQuery) => {
  return useQuery({
    queryKey: newsKeys.list(query),
    queryFn: () => getNewsApi(query),
    staleTime: 30_000,
  });
};
