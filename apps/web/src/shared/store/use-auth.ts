import { useAuthStore } from "./auth-store";

// 컴포넌트 내부에서 accessToken 가져오기
export const useGetAuth = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken;
};

// 컴포넌트 내부에서 accessToken 설정하기
export const useSetAuth = () => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  return setAccessToken;
};

// 컴포넌트 내부에서 accessToken 삭제하기
export const useClearAuth = () => {
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);
  return clearAccessToken;
};

// 컴포넌트 외부에서 accessToken 가져오기 (API 호출, 유틸 함수 등)
export const getAccessToken = () => {
  return useAuthStore.getState().accessToken;
};

// 컴포넌트 외부에서 accessToken 설정하기
export const setAccessToken = (token: string) => {
  useAuthStore.getState().setAccessToken(token);
};

// 컴포넌트 외부에서 accessToken 삭제하기
export const clearAccessToken = () => {
  useAuthStore.getState().clearAccessToken();
};
