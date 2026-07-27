"use client";

import { useMemo, useState } from "react";

import type { AlertRule } from "@dobbit/shared";

import { type NewsAlertDirection, createNewsAlertPayload } from "../utils";

import { useAlertRules } from "./useAlertRules";
import { useCreateAlertRule } from "./useCreateAlertRule";
import { useDeleteAlertRule } from "./useDeleteAlertRule";

export const useNewsAlertSettings = () => {
  const [marketCode, setMarketCode] = useState("");
  const [direction, setDirection] = useState<NewsAlertDirection>("DOWN");
  const [threshold, setThreshold] = useState("0.4");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendSlack, setSendSlack] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const alertRulesQuery = useAlertRules();
  const createMutation = useCreateAlertRule();
  const deleteMutation = useDeleteAlertRule();
  const newsSentimentRules = useMemo(
    () => alertRulesQuery.data?.filter((rule) => rule.type === "NEWS_SENTIMENT") ?? [],
    [alertRulesQuery.data],
  );

  const submitNewsAlert = () => {
    setStatusMessage(null);
    const payload = createNewsAlertPayload({ marketCode, direction, threshold, sendInApp, sendSlack });

    if (!payload) {
      setStatusMessage("마켓 코드와 기준값을 확인해주세요.");
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        setMarketCode("");
        setThreshold("0.4");
        setStatusMessage("뉴스 감성 알림 규칙이 저장되었습니다.");
      },
      onError: () => setStatusMessage("뉴스 감성 알림 규칙 저장에 실패했습니다."),
    });
  };

  const deleteNewsAlert = (rule: AlertRule) => {
    if (!window.confirm(`${rule.marketCode} 뉴스 감성 알림을 삭제할까요?`)) return;

    setStatusMessage(null);
    deleteMutation.mutate(rule.id, {
      onSuccess: () => setStatusMessage("뉴스 감성 알림 규칙이 삭제되었습니다."),
      onError: () => setStatusMessage("뉴스 감성 알림 규칙 삭제에 실패했습니다."),
    });
  };

  return {
    marketCode,
    direction,
    threshold,
    sendInApp,
    sendSlack,
    statusMessage,
    newsSentimentRules,
    isRulesPending: alertRulesQuery.isPending,
    isRulesError: alertRulesQuery.isError,
    isCreatePending: createMutation.isPending,
    isDeletingRule: (ruleId: string) => deleteMutation.isPending && deleteMutation.variables === ruleId,
    changeMarketCode: setMarketCode,
    changeDirection: setDirection,
    changeThreshold: setThreshold,
    changeSendInApp: setSendInApp,
    changeSendSlack: setSendSlack,
    submitNewsAlert,
    deleteNewsAlert,
  };
};
