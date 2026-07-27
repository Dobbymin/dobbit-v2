"use client";

import { useState } from "react";

import { createSlackIntegrationPayload } from "../utils";

import { useSaveSlackIntegration, useSlackIntegration, useTestSlackIntegration } from "./useNotifications";

export const useSlackIntegrationSettings = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const slackQuery = useSlackIntegration();
  const saveMutation = useSaveSlackIntegration();
  const testMutation = useTestSlackIntegration();

  const saveSlackIntegration = () => {
    setStatusMessage(null);
    saveMutation.mutate(createSlackIntegrationPayload({ webhookUrl, channelName, enabled }), {
      onSuccess: () => {
        setWebhookUrl("");
        setStatusMessage("Slack Webhook이 저장되었습니다.");
      },
      onError: () => setStatusMessage("Slack Webhook 저장에 실패했습니다."),
    });
  };

  const testSlackIntegration = () => {
    setStatusMessage(null);
    testMutation.mutate(undefined, {
      onSuccess: (result) => {
        setStatusMessage(result.success ? "테스트 메시지를 발송했습니다." : "테스트 메시지 발송에 실패했습니다.");
      },
      onError: () => setStatusMessage("테스트 메시지 발송에 실패했습니다."),
    });
  };

  return {
    integration: slackQuery.data,
    webhookUrl,
    channelName,
    enabled,
    statusMessage,
    isSavePending: saveMutation.isPending,
    isTestPending: testMutation.isPending,
    changeWebhookUrl: setWebhookUrl,
    changeChannelName: setChannelName,
    changeEnabled: setEnabled,
    saveSlackIntegration,
    testSlackIntegration,
  };
};
