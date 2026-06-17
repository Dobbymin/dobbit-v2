import { apiClient } from "@/shared";
import type {
  AlertRule,
  CreateAlertRuleRequest,
  DeleteAlertRuleResponse,
  UpdateAlertRuleRequest,
} from "@dobbit/shared";

export const getAlertRules = (): Promise<AlertRule[]> => apiClient<AlertRule[]>("/alert/rules");

export const createAlertRule = (request: CreateAlertRuleRequest): Promise<AlertRule> =>
  apiClient<AlertRule>("/alert/rules", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const updateAlertRule = (id: string, request: UpdateAlertRuleRequest): Promise<AlertRule> =>
  apiClient<AlertRule>(`/alert/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const deleteAlertRule = (id: string): Promise<DeleteAlertRuleResponse> =>
  apiClient<DeleteAlertRuleResponse>(`/alert/rules/${id}`, { method: "DELETE" });
