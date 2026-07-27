import { describe, expect, it } from "vitest";

import { isValidNickname, normalizeNickname } from "./nickname";

describe("nickname utils", () => {
  it("trims nickname values before validation", () => {
    expect(normalizeNickname("  도빗  ")).toBe("도빗");
    expect(isValidNickname(normalizeNickname("  도빗  "))).toBe(true);
  });

  it("accepts only nicknames with two through twenty-four characters", () => {
    expect(isValidNickname("a")).toBe(false);
    expect(isValidNickname("a".repeat(24))).toBe(true);
    expect(isValidNickname("a".repeat(25))).toBe(false);
  });
});
