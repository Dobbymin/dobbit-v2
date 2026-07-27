// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMarketOrderForm } from "./useMarketOrderForm";

const mocks = vi.hoisted(() => ({
  buyMutate: vi.fn(),
  sellMutate: vi.fn(),
  reset: vi.fn(),
  changePrice: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  useAuthStore: vi.fn(),
  useOrderValues: vi.fn(),
  useOrderableCash: vi.fn(),
  buyPending: false,
  sellPending: false,
}));

vi.mock("@/shared", () => ({ useAuthStore: mocks.useAuthStore }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError, success: mocks.toastSuccess } }));
vi.mock("./useBuyOrder", () => ({ useBuyOrder: () => ({ mutate: mocks.buyMutate, isPending: mocks.buyPending }) }));
vi.mock("./useSellOrder", () => ({ useSellOrder: () => ({ mutate: mocks.sellMutate, isPending: mocks.sellPending }) }));
vi.mock("./useOrderableCash", () => ({ useOrderableCash: mocks.useOrderableCash }));
vi.mock("./useOrderValues", () => ({ useOrderValues: mocks.useOrderValues }));

describe("useMarketOrderForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buyPending = false;
    mocks.sellPending = true;
    mocks.useAuthStore.mockImplementation((selector: (state: { accessToken: string }) => string) =>
      selector({ accessToken: "token" }),
    );
    mocks.useOrderableCash.mockReturnValue({ data: 30000 });
    mocks.useOrderValues.mockReturnValue({
      price: "10000",
      amount: "2",
      total: "20000",
      isValid: true,
      changePrice: mocks.changePrice,
      reset: mocks.reset,
    });
  });

  it("exposes auth, cash, loading, and submits buy payload", () => {
    const { result } = renderHook(() => useMarketOrderForm("KRW-BTC"));

    expect(result.current).toMatchObject({ accessToken: "token", orderableCash: 30000, isLoading: true });
    act(() => result.current.buy());
    expect(mocks.buyMutate).toHaveBeenCalledWith(
      { marketCode: "KRW-BTC", price: 10000, quantity: 2 },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it("blocks invalid orders", () => {
    mocks.useOrderValues.mockReturnValue({
      price: "",
      amount: "",
      total: "",
      isValid: false,
      changePrice: mocks.changePrice,
      reset: mocks.reset,
    });
    const { result } = renderHook(() => useMarketOrderForm("KRW-BTC"));

    act(() => result.current.sell());
    expect(mocks.toastError).toHaveBeenCalledWith("가격과 수량을 올바르게 입력해주세요.");
    expect(mocks.sellMutate).not.toHaveBeenCalled();
  });

  it("keeps success reset and failure toast behavior", () => {
    const { result } = renderHook(() => useMarketOrderForm("KRW-BTC"));

    act(() => result.current.sell());
    const callbacks = mocks.sellMutate.mock.calls[0]?.[1] as { onSuccess: () => void; onError: (error: Error) => void };
    callbacks.onSuccess();
    callbacks.onError(new Error("denied"));

    expect(mocks.toastSuccess).toHaveBeenCalledWith("주문이 체결되었습니다.");
    expect(mocks.reset).toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith("denied");
  });
});
