import { afterEach, describe, expect, it, vi } from "vitest";

const loadChartColors = async () => {
  vi.resetModules();
  return (await import("./chart-colors")).CHART_COLORS;
};

describe("chart colors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("브라우저 API가 없는 SSR에서는 캔들 폴백 색상을 사용한다", async () => {
    const chartColors = await loadChartColors();

    expect(chartColors.candleUp).toBe("rgb(245,72,80)");
    expect(chartColors.candleDown).toBe("rgb(67,146,255)");
  });

  it("토큰을 읽지 못하면 캔들 폴백 색상을 사용한다", async () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", { documentElement: {} });
    vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "" }));

    const chartColors = await loadChartColors();

    expect(chartColors.candleUp).toBe("rgb(245,72,80)");
    expect(chartColors.candleDown).toBe("rgb(67,146,255)");
  });

  it("캔버스 변환에 실패하면 캔들 폴백 색상을 사용한다", async () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", {
      documentElement: {},
      createElement: () => ({
        getContext: () => null,
      }),
    });
    vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "oklch(0.5 0.2 30)" }));

    const chartColors = await loadChartColors();

    expect(chartColors.candleUp).toBe("rgb(245,72,80)");
    expect(chartColors.candleDown).toBe("rgb(67,146,255)");
  });
});
