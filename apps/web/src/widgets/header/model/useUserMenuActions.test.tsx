// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUserMenuActions } from "./useUserMenuActions";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  push: vi.fn(),
  useIsAuth: vi.fn(),
  useLogout: vi.fn(),
  useProfile: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/auth", () => ({ useLogout: mocks.useLogout }));
vi.mock("@/features/setting", () => ({ useProfile: mocks.useProfile }));
vi.mock("@/shared/store", () => ({ useIsAuth: mocks.useIsAuth }));

describe("useUserMenuActions", () => {
  it("navigates to settings and calls logout mutation", () => {
    mocks.useIsAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mocks.useLogout.mockReturnValue({ isPending: false, mutate: mocks.mutate });
    mocks.useProfile.mockReturnValue({ data: { nickname: "도빗" } });
    const { result } = renderHook(useUserMenuActions);

    act(() => result.current.navigateToSettings());
    act(() => result.current.logout());

    expect(result.current.displayName).toBe("도빗");
    expect(mocks.push).toHaveBeenCalledWith("/setting");
    expect(mocks.mutate).toHaveBeenCalled();
  });
});
