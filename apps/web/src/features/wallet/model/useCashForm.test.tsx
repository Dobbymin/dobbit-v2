// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCashForm } from "./useCashForm";

const mocks = vi.hoisted(() => ({
  depositMutate: vi.fn(),
  withdrawMutate: vi.fn(),
  depositPending: false,
  withdrawPending: false,
  depositError: null as Error | null,
  withdrawError: null as Error | null,
}));

vi.mock("./useDeposit", () => ({
  useDeposit: () => ({
    mutate: mocks.depositMutate,
    isPending: mocks.depositPending,
    isError: mocks.depositError !== null,
    error: mocks.depositError,
  }),
}));
vi.mock("./useWithdraw", () => ({
  useWithdraw: () => ({
    mutate: mocks.withdrawMutate,
    isPending: mocks.withdrawPending,
    isError: mocks.withdrawError !== null,
    error: mocks.withdrawError,
  }),
}));

describe("useCashForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.depositPending = false;
    mocks.withdrawPending = false;
    mocks.depositError = null;
    mocks.withdrawError = null;
  });

  it("submits valid deposit and withdraw values through their mutations", async () => {
    const { result } = renderHook(() => useCashForm());

    act(() => {
      result.current.depositForm.setValue("amount", "1000");
      result.current.withdrawForm.setValue("amount", "2000");
    });
    await act(async () => {
      await result.current.submitDeposit();
      await result.current.submitWithdraw();
    });

    expect(mocks.depositMutate).toHaveBeenCalledWith(
      { amount: 1000 },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(mocks.withdrawMutate).toHaveBeenCalledWith(
      { amount: 2000 },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("resets amount and closes dialog after mutation success", async () => {
    const { result } = renderHook(() => useCashForm());

    act(() => {
      result.current.changeDepositOpen(true);
      result.current.depositForm.setValue("amount", "1000");
    });
    await act(async () => {
      await result.current.submitDeposit();
    });
    const callbacks = mocks.depositMutate.mock.calls[0]?.[1] as { onSuccess: () => void };
    act(() => callbacks.onSuccess());

    expect(result.current.depositOpen).toBe(false);
    expect(result.current.depositForm.getValues("amount")).toBe(0);
  });

  it("exposes pending and error inputs for dialog UI", () => {
    mocks.depositPending = true;
    mocks.withdrawError = new Error("출금 실패");

    const { result } = renderHook(() => useCashForm());

    expect(result.current.isDepositPending).toBe(true);
    expect(result.current.isWithdrawPending).toBe(false);
    expect(result.current.depositError).toBeNull();
    expect(result.current.withdrawError).toEqual(new Error("출금 실패"));
  });
});
