import type { AlertRule, CreateAlertRuleRequest } from "@dobbit/shared";

export type NewsAlertDirection = "UP" | "DOWN";

const DEFAULT_COOLDOWN_SECONDS = 3_600;

export const normalizeNewsAlertMarketCode = (value: string) => {
  const marketCode = value.trim().toUpperCase();
  return marketCode.startsWith("KRW-") ? marketCode : `KRW-${marketCode}`;
};

export const getNewsAlertDirection = (rule: AlertRule): NewsAlertDirection => {
  if (rule.comparison === "LTE" || rule.threshold < 0) return "DOWN";

  return "UP";
};

type NewsAlertFormValues = {
  marketCode: string;
  direction: NewsAlertDirection;
  threshold: string;
  sendInApp: boolean;
  sendSlack: boolean;
};

export const createNewsAlertPayload = (values: NewsAlertFormValues): CreateAlertRuleRequest | null => {
  const marketCode = normalizeNewsAlertMarketCode(values.marketCode);
  const absoluteThreshold = Math.abs(Number(values.threshold));

  if (!marketCode || marketCode === "KRW-" || Number.isNaN(absoluteThreshold)) return null;

  return {
    marketCode,
    type: "NEWS_SENTIMENT",
    comparison: values.direction === "UP" ? "GTE" : "LTE",
    threshold: values.direction === "UP" ? absoluteThreshold : -absoluteThreshold,
    sendInApp: values.sendInApp,
    sendSlack: values.sendSlack,
    cooldownSeconds: DEFAULT_COOLDOWN_SECONDS,
  };
};
