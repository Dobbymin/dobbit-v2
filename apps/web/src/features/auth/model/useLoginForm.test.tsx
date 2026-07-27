// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLoginForm } from "./useLoginForm";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  error: null as Error | null,
}));

vi.mock("./useLogin", () => ({
  useLogin: () => ({
    mutate: mocks.mutate,
    isPending: mocks.isPending,
    isError: mocks.error !== null,
    error: mocks.error,
  }),
}));

describe("useLoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isPending = false;
    mocks.error = null;
  });

  it("submits valid login values through mutation", async () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.form.setValue("username", "dobbit_user");
      result.current.form.setValue("password", "password123");
    });
    await act(async () => {
      await result.current.submitLogin();
    });

    expect(mocks.mutate).toHaveBeenCalledWith({ username: "dobbit_user", password: "password123" });
  });

  it("blocks invalid login values", async () => {
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.submitLogin();
    });

    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("exposes mutation pending and error state", () => {
    mocks.isPending = true;
    mocks.error = new Error("로그인 실패");

    const { result } = renderHook(() => useLoginForm());

    expect(result.current.isLoginPending).toBe(true);
    expect(result.current.loginError).toEqual(new Error("로그인 실패"));
  });
});
