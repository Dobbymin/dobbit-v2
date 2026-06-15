"use client";

import { useQuery } from "@tanstack/react-query";

import { getProfileApi } from "../api";

import { settingKeys } from "./setting-query-keys";

export const useProfile = () => {
  return useQuery({
    queryKey: settingKeys.profile(),
    queryFn: getProfileApi,
    staleTime: 30_000,
  });
};
