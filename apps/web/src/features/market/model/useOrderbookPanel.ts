"use client";

import { useMemo } from "react";

import { toOrderbookViewModel } from "./libs";
import { useOrderbook } from "./useOrderbook";

export const useOrderbookPanel = (marketCode: string) => {
  const { data, isLoading } = useOrderbook(marketCode);
  const viewModel = useMemo(() => toOrderbookViewModel(data?.units ?? []), [data?.units]);

  return { ...viewModel, isLoading };
};
