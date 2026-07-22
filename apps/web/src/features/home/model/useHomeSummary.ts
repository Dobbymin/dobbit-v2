"use client";

import { useQuery } from "@tanstack/react-query";

import { getHomeSummaryApi } from "../api";

import { homeKeys } from "./home-query-keys";

export const useHomeSummary = () =>
  useQuery({
    queryKey: homeKeys.summary(),
    queryFn: getHomeSummaryApi,
    staleTime: 60_000,
  });
