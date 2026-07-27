"use client";

import { useRouter } from "next/navigation";

import { ROUTES_PATH } from "@/shared";

import { useLogout } from "@/features/auth";
import { useProfile } from "@/features/setting";

import { useIsAuth } from "@/shared/store";

export const useUserMenuActions = () => {
  const router = useRouter();
  const logoutMutation = useLogout();
  const profile = useProfile();
  const { isAuthenticated, isLoading } = useIsAuth();
  const displayName = profile.data?.nickname ?? profile.data?.username ?? "사용자";

  const navigateToSettings = () => router.push(ROUTES_PATH.SETTING);
  const logout = () => logoutMutation.mutate();

  return {
    displayName,
    logout,
    navigateToSettings,
    isAuthenticated,
    isLoading,
    isLogoutPending: logoutMutation.isPending,
  };
};
