"use client";

import { useQuery } from "@tanstack/react-query";

import { getAlertRules } from "../api";

export const alertQueryKeys = {
  all: ["alert-rules"] as const,
  list: () => ["alert-rules", "list"] as const,
};

export const useAlertRules = () => {
  return useQuery({
    queryKey: alertQueryKeys.list(),
    queryFn: getAlertRules,
    staleTime: 30_000,
  });
};
