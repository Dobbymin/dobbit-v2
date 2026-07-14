/**
 * ApexCharts 색상 단일 출처.
 *
 * ApexCharts는 SVG 속성에 색 문자열을 직접 주입하므로 Tailwind 클래스나
 * `var(--token)`을 그대로 넘길 수 없다. 따라서 디자인 토큰과 같은 값을 쓰되
 * 여기 한 곳에서만 관리한다.
 *
 * - CANDLE_UP / CANDLE_DOWN: 도메인 토큰 increase / decrease 와 동일 값
 *   (한국 증시 관습: 상승=빨강, 하락=파랑)
 * - 나머지는 뉴트럴 계열(그리드·볼륨·브러시)
 */
export const CHART_COLORS = {
  /** increase (상승) */
  candleUp: "#dd3c44",
  /** decrease (하락) */
  candleDown: "#1375ec",
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
