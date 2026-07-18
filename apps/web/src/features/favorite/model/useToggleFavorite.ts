"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useIsAuth } from "@/shared/store";

import { addFavoriteApi, removeFavoriteApi } from "../api";

import { favoriteKeys } from "./favorite-query-keys";

type ToggleFavoriteVariables = {
  marketCode: string;
  isFavorited: boolean;
};

type ToggleFavoriteContext = {
  snapshot: string[] | undefined;
};

export const TOGGLE_FAVORITE_ERROR_MESSAGE = "관심 업데이트에 실패했어요.";

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useIsAuth();

  return useMutation<void, Error, ToggleFavoriteVariables, ToggleFavoriteContext>({
    mutationFn: ({ marketCode, isFavorited }) => {
      if (!isAuthenticated) {
        return Promise.reject(new Error("로그인이 필요합니다."));
      }

      return isFavorited ? removeFavoriteApi(marketCode) : addFavoriteApi(marketCode);
    },
    onMutate: async ({ marketCode, isFavorited }) => {
      if (!isAuthenticated) {
        return { snapshot: undefined };
      }

      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });
      const snapshot = queryClient.getQueryData<string[]>(favoriteKeys.list());

      queryClient.setQueryData<string[]>(favoriteKeys.list(), (favorites = []) => {
        if (isFavorited) {
          return favorites.filter((favorite) => favorite !== marketCode);
        }

        return favorites.includes(marketCode) ? favorites : [...favorites, marketCode];
      });

      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(favoriteKeys.list(), context.snapshot);
      }

      toast.error(TOGGLE_FAVORITE_ERROR_MESSAGE);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: favoriteKeys.all }),
  });
};
