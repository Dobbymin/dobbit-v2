import { describe, expect, it } from "vitest";

import { createNewsAlertPayload, normalizeNewsAlertMarketCode } from "./news-alert";

describe("news alert utils", () => {
  it("normalizes market code and builds direction-specific payload", () => {
    expect(normalizeNewsAlertMarketCode(" btc ")).toBe("KRW-BTC");
    expect(
      createNewsAlertPayload({
        marketCode: " btc ",
        direction: "DOWN",
        threshold: "-0.4",
        sendInApp: true,
        sendSlack: false,
      }),
    ).toEqual({
      marketCode: "KRW-BTC",
      type: "NEWS_SENTIMENT",
      comparison: "LTE",
      threshold: -0.4,
      sendInApp: true,
      sendSlack: false,
      cooldownSeconds: 3_600,
    });
  });

  it("rejects incomplete market codes and non-numeric thresholds", () => {
    expect(
      createNewsAlertPayload({ marketCode: "", direction: "UP", threshold: "0.4", sendInApp: true, sendSlack: false }),
    ).toBeNull();
    expect(
      createNewsAlertPayload({
        marketCode: "BTC",
        direction: "UP",
        threshold: "invalid",
        sendInApp: true,
        sendSlack: false,
      }),
    ).toBeNull();
  });
});
