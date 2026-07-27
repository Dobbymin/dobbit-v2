// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useNicknameField } from "./useNicknameField";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  isLoading: false,
  isPending: false,
  error: null as Error | null,
}));

vi.mock("./useProfile", () => ({
  useProfile: () => ({ data: { nickname: "기존닉네임" }, isLoading: mocks.isLoading }),
}));
vi.mock("./useUpdateNickname", () => ({
  useUpdateNickname: () => ({ isPending: mocks.isPending, error: mocks.error, mutate: mocks.mutate }),
}));

describe("useNicknameField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isLoading = false;
    mocks.isPending = false;
    mocks.error = null;
  });

  it("validates trimmed nicknames and submits normalized payload", () => {
    const { result } = renderHook(() => useNicknameField());

    act(() => {
      result.current.editNickname();
      result.current.changeNickname("  새닉네임  ");
    });
    act(() => {
      result.current.editNickname();
    });

    expect(mocks.mutate).toHaveBeenCalledWith(
      { nickname: "새닉네임" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("exposes mutation status for UI", () => {
    mocks.isPending = true;
    mocks.error = new Error("저장 실패");

    const { result } = renderHook(() => useNicknameField());

    expect(result.current.isUpdatePending).toBe(true);
    expect(result.current.updateError).toEqual(new Error("저장 실패"));
  });
});
