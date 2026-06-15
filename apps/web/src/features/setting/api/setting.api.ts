import { apiClient } from "@/shared";

import type { User } from "@/entities/user";

export type ProfileResponse = User;

export type UpdateNicknameRequest = {
  nickname: string;
};

export const getProfileApi = (): Promise<ProfileResponse> => apiClient<ProfileResponse>("/auth/me");

export const updateNicknameApi = (request: UpdateNicknameRequest): Promise<ProfileResponse> =>
  apiClient<ProfileResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(request),
  });
