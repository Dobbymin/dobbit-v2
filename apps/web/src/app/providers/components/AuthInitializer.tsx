"use client";

import { useEffect } from "react";

import { refreshApi } from "@/features/auth";
import { setAccessToken, useAuthStore } from "@/shared/store";

export const AuthInitializer = () => {
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await refreshApi();
        if (response.accessToken) {
          setAccessToken(response.accessToken);
        }
      } catch {
        // Silent refresh 실패 시에도 초기화만 진행 (로그인 페이지로 리다이렉트는 미처리)
      } finally {
        setInitialized();
      }
    };

    initializeAuth();
  }, [setInitialized]);

  return null;
};
