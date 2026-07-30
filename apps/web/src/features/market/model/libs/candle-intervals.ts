export type CandleInterval = {
  label: string;
  type: "seconds" | "minutes" | "days" | "weeks" | "months" | "years";
  unit?: number;
};

export const CANDLE_INTERVALS: CandleInterval[] = [
  { label: "1초", type: "seconds" },
  { label: "1분", type: "minutes", unit: 1 },
  { label: "5분", type: "minutes", unit: 5 },
  { label: "30분", type: "minutes", unit: 30 },
  { label: "1시간", type: "minutes", unit: 60 },
  { label: "일", type: "days" },
  { label: "주", type: "weeks" },
  { label: "달", type: "months" },
  { label: "년", type: "years" },
];

export const DEFAULT_CANDLE_INTERVAL: CandleInterval = {
  label: "1시간",
  type: "minutes",
  unit: 60,
};
