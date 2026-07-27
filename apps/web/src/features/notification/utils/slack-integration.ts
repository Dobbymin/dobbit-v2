import type { SlackWebhookUpsertRequest } from "@dobbit/shared";

type SlackIntegrationFormValues = {
  webhookUrl: string;
  channelName: string;
  enabled: boolean;
};

export const createSlackIntegrationPayload = ({
  webhookUrl,
  channelName,
  enabled,
}: SlackIntegrationFormValues): SlackWebhookUpsertRequest => ({
  webhookUrl,
  channelName: channelName || undefined,
  enabled,
});
