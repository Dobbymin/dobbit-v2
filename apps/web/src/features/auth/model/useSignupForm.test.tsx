// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSignupForm } from "./useSignupForm";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  error: null as Error | null,
}));

vi.mock("./useSignup", () => ({
  useSignup: () => ({
    mutate: mocks.mutate,
    isPending: mocks.isPending,
    isError: mocks.error !== null,
    error: mocks.error,
  }),
}));

describe("useSignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isPending = false;
    mocks.error = null;
  });

  it("submits valid signup values through mutation", async () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.form.setValue("username", "dobbit_user");
      result.current.form.setValue("password", "password123");
      result.current.form.setValue("nickname", "도빗");
    });
    await act(async () => {
      await result.current.submitSignup();
    });

    expect(mocks.mutate).toHaveBeenCalledWith({ username: "dobbit_user", password: "password123", nickname: "도빗" });
  });

  it("blocks invalid signup values", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      await result.current.submitSignup();
    });

    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("exposes mutation pending and error state", () => {
    mocks.isPending = true;
    mocks.error = new Error("회원가입 실패");

    const { result } = renderHook(() => useSignupForm());

    expect(result.current.isSignupPending).toBe(true);
    expect(result.current.signupError).toEqual(new Error("회원가입 실패"));
  });
});
