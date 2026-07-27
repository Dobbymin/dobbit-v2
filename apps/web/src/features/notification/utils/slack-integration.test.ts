import { describe, expect, it } from "vitest";

import { createSlackIntegrationPayload } from "./slack-integration";

describe("slack integration utils", () => {
  it("builds save payload and omits empty channel names", () => {
    expect(
      createSlackIntegrationPayload({ webhookUrl: "https://hooks.slack.com/test", channelName: "", enabled: true }),
    ).toEqual({
      webhookUrl: "https://hooks.slack.com/test",
      channelName: undefined,
      enabled: true,
    });
  });
});
