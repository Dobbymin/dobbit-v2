export type AlertRuleType =
  | "PRICE_CHANGE_RATE"
  | "PROFIT_RATE_TARGET"
  | "LOSS_RATE_LIMIT"
  | "VOLUME_SPIKE"
  | "NEWS_SENTIMENT";
export type AlertComparison = "GTE" | "LTE";

export interface AlertRule {
  id: string;
  marketCode: string;
  type: AlertRuleType;
  threshold: number;
  comparison: AlertComparison;
  enabled: boolean;
  sendInApp: boolean;
  sendSlack: boolean;
  cooldownSeconds: number;
  lastTriggeredAt: string | null;
}

export interface CreateAlertRuleRequest {
  marketCode: string;
  type: AlertRuleType;
  threshold: number;
  comparison: AlertComparison;
  sendInApp: boolean;
  sendSlack: boolean;
  cooldownSeconds: number;
}

export interface UpdateAlertRuleRequest extends Partial<CreateAlertRuleRequest> {
  enabled?: boolean;
}

export interface DeleteAlertRuleResponse {
  success: true;
}

export interface AlertCondition {
  type: AlertRuleType;
  threshold: number;
  comparison: AlertComparison;
}

export interface AlertEvaluationRequest {
  marketCode: string;
  tradePrice: number;
  signedChangeRate: number;
  accTradeVolume24h: number;
  snapshotAt?: string;
}

export interface AlertEvaluationResult {
  evaluatedRuleCount: number;
  triggeredRuleCount: number;
  skippedRuleCount: number;
}

export interface SlackWebhookUpsertRequest {
  webhookUrl: string;
  channelName?: string;
  enabled?: boolean;
}

export interface SlackIntegrationResponse {
  enabled: boolean;
  channelName: string | null;
  lastTestedAt: string | null;
  lastErrorMessage: string | null;
}

export interface SlackTestResponse {
  success: boolean;
  lastTestedAt: string;
  lastErrorMessage: string | null;
}
