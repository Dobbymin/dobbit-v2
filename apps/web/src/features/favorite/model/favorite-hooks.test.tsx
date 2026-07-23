// @vitest-environment jsdom
import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { favoriteKeys } from "./favorite-query-keys";
import { useFavorites } from "./useFavorites";
import { TOGGLE_FAVORITE_ERROR_MESSAGE, useToggleFavorite } from "./useToggleFavorite";

const mocks = vi.hoisted(() => ({
  addFavoriteApi: vi.fn(),
  getFavoritesApi: vi.fn(),
  removeFavoriteApi: vi.fn(),
  toastError: vi.fn(),
  useIsAuth: vi.fn(),
}));

vi.mock("../api", () => ({
  addFavoriteApi: mocks.addFavoriteApi,
  getFavoritesApi: mocks.getFavoritesApi,
  removeFavoriteApi: mocks.removeFavoriteApi,
}));

vi.mock("@/shared/store", () => ({
  useIsAuth: mocks.useIsAuth,
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

describe("favorite hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates favorite cache optimistically", async () => {
    const queryClient = new QueryClient();
    const deferred = createDeferred<void>();
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mocks.addFavoriteApi.mockReturnValue(deferred.promise);
    queryClient.setQueryData(favoriteKeys.list(), ["KRW-BTC"]);

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ marketCode: "KRW-ETH", isFavorited: false });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(favoriteKeys.list())).toEqual(["KRW-BTC", "KRW-ETH"]);
    });

    deferred.resolve();
  });

  it("rolls favorite cache back after failed mutation", async () => {
    const queryClient = new QueryClient();
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mocks.removeFavoriteApi.mockRejectedValue(new Error("failed"));
    queryClient.setQueryData(favoriteKeys.list(), ["KRW-BTC", "KRW-ETH"]);

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ marketCode: "KRW-ETH", isFavorited: true });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(favoriteKeys.list())).toEqual(["KRW-BTC", "KRW-ETH"]);
      expect(mocks.toastError).toHaveBeenCalledWith(TOGGLE_FAVORITE_ERROR_MESSAGE);
    });
  });

  it("does not fetch favorites when unauthenticated", async () => {
    const queryClient = new QueryClient();
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderHook(() => useFavorites(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(mocks.getFavoritesApi).not.toHaveBeenCalled();
    });
  });

  it("does not toggle favorites when unauthenticated", async () => {
    const queryClient = new QueryClient();
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    queryClient.setQueryData(favoriteKeys.list(), ["KRW-BTC"]);

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ marketCode: "KRW-ETH", isFavorited: false });
    });

    await waitFor(() => {
      expect(mocks.addFavoriteApi).not.toHaveBeenCalled();
      expect(queryClient.getQueryData(favoriteKeys.list())).toEqual(["KRW-BTC"]);
    });
  });
});
