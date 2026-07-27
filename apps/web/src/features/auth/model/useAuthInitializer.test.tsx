// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthInitializer } from "./useAuthInitializer";

const mocks = vi.hoisted(() => ({
  refreshApi: vi.fn(),
  setAccessToken: vi.fn(),
  setInitialized: vi.fn(),
  useAuthStore: vi.fn(),
}));

vi.mock("../api", () => ({ refreshApi: mocks.refreshApi }));
vi.mock("@/shared/store", () => ({
  setAccessToken: mocks.setAccessToken,
  useAuthStore: mocks.useAuthStore,
}));

describe("useAuthInitializer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuthStore.mockImplementation((selector: (state: { setInitialized: () => void }) => () => void) =>
      selector({ setInitialized: mocks.setInitialized }),
    );
  });

  it("persists refreshed access token before completing initialization", async () => {
    mocks.refreshApi.mockResolvedValue({ accessToken: "refreshed-token" });

    renderHook(() => useAuthInitializer());

    await waitFor(() => expect(mocks.setInitialized).toHaveBeenCalledTimes(1));
    expect(mocks.setAccessToken).toHaveBeenCalledWith("refreshed-token");
  });

  it("completes initialization when refresh fails", async () => {
    mocks.refreshApi.mockRejectedValue(new Error("refresh failed"));

    renderHook(() => useAuthInitializer());

    await waitFor(() => expect(mocks.setInitialized).toHaveBeenCalledTimes(1));
    expect(mocks.setAccessToken).not.toHaveBeenCalled();
  });
});
