import { authToken } from "./auth-token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

type RequestOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

const doFetch = async (path: string, options: RequestOptions = {}): Promise<Response> => {
  const { skipAuthRefresh: _, ...init } = options;
  const headers = new Headers(init.headers);
  const token = authToken.get();

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

export const apiClient = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await doFetch(path, options);

  if (response.status !== 401 || options.skipAuthRefresh) {
    return parseResponse<T>(response);
  }

  const refreshed = await doFetch("/auth/refresh", { method: "POST", skipAuthRefresh: true });

  if (!refreshed.ok) {
    authToken.clear();
    redirectToLogin();
    return parseResponse<T>(response);
  }

  const { accessToken: newToken } = await parseResponse<{ accessToken: string }>(refreshed);

  if (!newToken) {
    authToken.clear();
    redirectToLogin();
    return parseResponse<T>(response);
  }

  authToken.set(newToken);

  const retryResponse = await doFetch(path, options);
  return parseResponse<T>(retryResponse);
};
