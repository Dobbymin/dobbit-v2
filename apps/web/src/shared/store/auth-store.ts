import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type AccessTokenState = {
  accessToken: string | null;
  isInitialized: boolean;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  setInitialized: () => void;
};

const initialState: Omit<AccessTokenState, "setAccessToken" | "clearAccessToken" | "setInitialized"> = {
  accessToken: null,
  isInitialized: false,
};

export const useAuthStore = create<AccessTokenState>()(
  devtools(
    immer(
      combine(initialState, (set) => ({
        setAccessToken: (token: string) =>
          set((state) => {
            state.accessToken = token;
          }),
        clearAccessToken: () =>
          set((state) => {
            state.accessToken = null;
          }),
        setInitialized: () =>
          set((state) => {
            state.isInitialized = true;
          }),
      })),
    ),
    {
      name: "auth-store",
    },
  ),
);
