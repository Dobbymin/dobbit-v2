import { describe, expect, it } from "vitest";

import { formatRelativeTime, toHomeNewsDisplayItems } from "./news-display";

describe("home news display", () => {
  const now = Date.parse("2026-07-27T12:00:00.000Z");

  it("formats relative times", () => {
    expect(formatRelativeTime("2026-07-27T11:59:30.000Z", now)).toBe("방금 전");
    expect(formatRelativeTime("2026-07-27T10:00:00.000Z", now)).toBe("2시간 전");
    expect(formatRelativeTime("2026-07-25T12:00:00.000Z", now)).toBe("2일 전");
  });

  it("builds sentiment presentation values", () => {
    expect(
      toHomeNewsDisplayItems(
        [
          {
            id: "1",
            title: "news",
            url: "https://example.com",
            publisher: null,
            publishedAt: "2026-07-27T11:00:00.000Z",
            sentiment: "POSITIVE",
          },
        ],
        now,
      )[0],
    ).toMatchObject({ relativeTime: "1시간 전", sentimentClassName: "text-increase", sentimentLabel: "호재" });
  });
});
