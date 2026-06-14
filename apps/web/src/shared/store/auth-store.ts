import { create } from "zustand";

import { authToken } from "@/shared/api";

type AuthState = {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: authToken.get(),
  setAccessToken: (token) => {
    authToken.set(token);
    set({ accessToken: token });
  },
  clearAccessToken: () => {
    authToken.clear();
    set({ accessToken: null });
  },
}));
