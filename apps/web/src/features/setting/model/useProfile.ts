"use client";

import { useQuery } from "@tanstack/react-query";

import { useIsAuth } from "@/shared/store";

import { getProfileApi } from "../api";

import { settingKeys } from "./setting-query-keys";

export const useProfile = () => {
  const { isAuthenticated } = useIsAuth();

  return useQuery({
    queryKey: settingKeys.profile(),
    queryFn: getProfileApi,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
};
