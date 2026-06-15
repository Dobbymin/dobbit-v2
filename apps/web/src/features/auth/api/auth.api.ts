import type { User } from "@/entities/user";

import { apiClient } from "@/shared/api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  nickname?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type RefreshResponse = {
  accessToken: string;
};

export type LogoutResponse = {
  ok: boolean;
};

export const loginApi = (request: LoginRequest): Promise<AuthResponse> =>
  apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuthRefresh: true,
  });

export const signupApi = (request: SignupRequest): Promise<AuthResponse> =>
  apiClient<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuthRefresh: true,
  });

export const logoutApi = (): Promise<LogoutResponse> =>
  apiClient<LogoutResponse>("/auth/logout", {
    method: "POST",
  });

export const refreshApi = (): Promise<RefreshResponse> =>
  apiClient<RefreshResponse>("/auth/refresh", {
    method: "POST",
    skipAuthRefresh: true,
  });
