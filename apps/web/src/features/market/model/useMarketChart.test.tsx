// @vitest-environment jsdom
import { act, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMarketChart } from "./useMarketChart";

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(_callback: unknown) {
    ResizeObserverMock.instances.push(this);
  }
}

const ChartHarness = () => {
  const { chartWrapperRef } = useMarketChart();
  return <div ref={chartWrapperRef} />;
};

describe("useMarketChart", () => {
  afterEach(() => {
    ResizeObserverMock.instances = [];
    vi.unstubAllGlobals();
  });

  it("updates chart state through verb actions", () => {
    const { result } = renderHook(() => useMarketChart());
    act(() => {
      result.current.selectChartType("line");
      result.current.setMovingAveragesVisible(true);
    });
    expect(result.current.chartType).toBe("line");
    expect(result.current.showMovingAverages).toBe(true);
  });

  it("disconnects ResizeObserver on unmount", () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const { unmount } = render(<ChartHarness />);
    expect(ResizeObserverMock.instances).toHaveLength(1);
    unmount();
    expect(ResizeObserverMock.instances[0]!.disconnect).toHaveBeenCalledOnce();
  });
});
