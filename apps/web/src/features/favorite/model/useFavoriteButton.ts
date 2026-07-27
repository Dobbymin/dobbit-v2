"use client";

import type { MouseEvent } from "react";

import { useIsAuth } from "@/shared/store";

import { useFavorites } from "./useFavorites";
import { useToggleFavorite } from "./useToggleFavorite";

export const useFavoriteButton = (marketCode: string) => {
  const { isAuthenticated } = useIsAuth();
  const { data: favorites } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();
  const isFavorited = favorites?.has(marketCode) ?? false;

  const toggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleFavoriteMutation.mutate({ marketCode, isFavorited });
  };

  return { isAuthenticated, isFavorited, toggleFavorite };
};
