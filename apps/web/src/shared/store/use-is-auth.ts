import { useAuthStore } from "./auth-store";

/**
 * 로그인 여부를 판단하는 훅
 * - accessToken 존재 여부
 * - isInitialized 상태
 */
export const useIsAuth = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // 초기화되지 않았으면 로딩 중
  const isLoading = !isInitialized;

  // accessToken이 있으면 인증된 상태
  const isAuthenticated = !!accessToken;

  return {
    isAuthenticated,
    isLoading,
  };
};
