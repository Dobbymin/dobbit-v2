"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ROUTES_PATH } from "@/shared/constants";
import { useAuthStore } from "@/shared/store";

import { logoutApi } from "../api";

import { authKeys } from "./auth-query-keys";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: authKeys.all });
      router.push(ROUTES_PATH.LOGIN);
    },
  });
};
