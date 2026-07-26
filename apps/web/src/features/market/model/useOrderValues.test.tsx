// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useOrderValues } from "./useOrderValues";

describe("useOrderValues", () => {
  it("normalizes price and amount, then calculates total", () => {
    const { result } = renderHook(() => useOrderValues());

    act(() => result.current.changePrice("1,200.5x"));
    act(() => result.current.changeAmount("2.5.3"));

    expect(result.current).toMatchObject({ price: "1200.5", amount: "2.53", total: "3037", isValid: true });
  });

  it("normalizes total and calculates amount only with valid price", () => {
    const { result } = renderHook(() => useOrderValues());

    act(() => result.current.changeTotal("10,000.5"));
    expect(result.current).toMatchObject({ total: "100005", amount: "" });

    act(() => result.current.changePrice("2500"));
    act(() => result.current.changeTotal("10,000"));
    expect(result.current).toMatchObject({ total: "10000", amount: "4", isValid: true });
  });

  it("reports invalid values and resets all values", () => {
    const { result } = renderHook(() => useOrderValues());

    act(() => result.current.changePrice("0"));
    act(() => result.current.changeAmount("2"));
    expect(result.current.isValid).toBe(false);

    act(() => result.current.reset());
    expect(result.current).toMatchObject({ price: "", amount: "", total: "", isValid: false });
  });
});
