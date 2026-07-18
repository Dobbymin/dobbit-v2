"use client";

import { useQuery } from "@tanstack/react-query";

import { useIsAuth } from "@/shared/store";

import { getFavoritesApi } from "../api";

import { favoriteKeys } from "./favorite-query-keys";

export const useFavorites = () => {
  const { isAuthenticated } = useIsAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: getFavoritesApi,
    enabled: isAuthenticated,
    staleTime: 30_000,
    select: (favorites) => new Set(favorites),
  });

  return { data, isLoading, isError, error };
};
