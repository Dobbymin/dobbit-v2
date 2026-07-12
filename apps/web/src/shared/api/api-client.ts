import { clearAccessToken, getAccessToken, setAccessToken } from "@/shared/store/use-auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

type RequestOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

const doFetch = async (path: string, options: RequestOptions = {}): Promise<Response> => {
  const { skipAuthRefresh: _, ...init } = options;
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE_URL}${path}`, { ...init, credentials: "include", headers });
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign("/login");
};

// 여러 요청이 동시에 401을 받아도 refresh는 한 번만 수행한다 (single-flight).
let refreshPromise: Promise<string | null> | null = null;

// 새 accessToken이면 성공, null이면 재로그인 필요(refresh 토큰 만료·무효).
// 일시적 장애(500·네트워크 등)는 throw하여 세션을 유지한다.
const performTokenRefresh = async (): Promise<string | null> => {
  const refreshed = await doFetch("/auth/refresh", { method: "POST", skipAuthRefresh: true });

  // refresh 토큰(쿠키)이 만료/무효한 경우에만 재로그인이 필요하다.
  if (refreshed.status === 401) {
    return null;
  }

  // 그 외 비정상 응답(500 등)은 일시적 장애로 보고 세션을 유지한다.
  if (!refreshed.ok) {
    throw new Error(`Token refresh failed: HTTP ${refreshed.status}`);
  }

  const { accessToken } = (await refreshed.json()) as { accessToken?: string };
  return accessToken ?? null;
};

const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const apiClient = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await doFetch(path, options);

  if (response.status !== 401 || options.skipAuthRefresh) {
    return parseResponse<T>(response);
  }

  const newToken = await refreshAccessToken();

  // 재로그인이 필요한 경우(refresh 401 또는 토큰 누락)에만 로그인 페이지로 이동한다.
  if (!newToken) {
    clearAccessToken();
    redirectToLogin();
    return parseResponse<T>(response);
  }

  setAccessToken(newToken);

  const retryResponse = await doFetch(path, options);
  return parseResponse<T>(retryResponse);
};
