/**
 * ApexCharts 색상 단일 출처.
 *
 * ApexCharts는 SVG 속성에 색 문자열을 직접 주입하므로 Tailwind 클래스나
 * `var(--token)`을 그대로 넘길 수 없다. 따라서 디자인 토큰과 같은 값을 쓰되
 * 여기 한 곳에서만 관리한다.
 *
 * - CANDLE_UP / CANDLE_DOWN: 런타임 도메인 토큰 increase / decrease 값
 *   (한국 증시 관습: 상승=빨강, 하락=파랑)
 * - 나머지는 뉴트럴 계열(그리드·볼륨·브러시)
 */
const FALLBACK_CANDLE_UP = "rgb(245,72,80)";
const FALLBACK_CANDLE_DOWN = "rgb(67,146,255)";

const toRgb = (color: string): string | null => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.fillStyle = "rgba(0, 0, 0, 0)";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);

  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  if (alpha === 0) {
    return null;
  }

  return `rgb(${red},${green},${blue})`;
};

const getCandleColor = (token: "--increase" | "--decrease", fallback: string): string => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallback;
  }

  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    return value ? toRgb(value) ?? fallback : fallback;
  } catch {
    return fallback;
  }
};

const CANDLE_COLORS = {
  candleUp: getCandleColor("--increase", FALLBACK_CANDLE_UP),
  candleDown: getCandleColor("--decrease", FALLBACK_CANDLE_DOWN),
} as const;

export const CHART_COLORS = {
  /** increase (상승) */
  candleUp: CANDLE_COLORS.candleUp,
  /** decrease (하락) */
  candleDown: CANDLE_COLORS.candleDown,
  /** 볼륨 막대 (뉴트럴) */
  volumeBar: "#555555",
  /** 그리드 라인 */
  grid: "#333333",
  /** 브러시 선택 영역 */
  brushFill: "#cccccc",
  brushStroke: "#0d47a1",
  /** 이동평균선 */
  ma7: "#ffa500",
  ma20: "#4169e1",
  ma60: "#dc143c",
} as const;
