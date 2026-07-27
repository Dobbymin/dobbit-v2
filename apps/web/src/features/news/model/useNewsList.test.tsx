// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { NewsListItem } from "../api";

import { useNewsList } from "./useNewsList";

const mocks = vi.hoisted(() => ({
  useNews: vi.fn(),
}));

vi.mock("@/shared", () => ({
  useIntersectionObserver: (callback: () => void) => callback,
}));

vi.mock("./useNews", () => ({
  useNews: mocks.useNews,
}));

const newsItems: NewsListItem[] = Array.from({ length: 25 }, (_, index) => ({
  id: String(index),
  publishedAt: "2026-07-27T00:00:00.000Z",
  publisher: "publisher",
  source: "source",
  title: "title",
  url: "https://example.com",
}));

describe("useNewsList", () => {
  it("uses 100-item query, loads next page, resets for query changes", () => {
    mocks.useNews.mockReturnValue({ data: newsItems, isLoading: false });
    const { result, rerender } = renderHook(({ marketCode }) => useNewsList({ marketCode }), {
      initialProps: { marketCode: "KRW-BTC" },
    });

    expect(mocks.useNews).toHaveBeenLastCalledWith({ limit: 100, marketCode: "KRW-BTC" });
    expect(result.current.visibleItems).toHaveLength(10);

    act(() => result.current.observerRef(null));
    expect(result.current.visibleItems).toHaveLength(20);

    rerender({ marketCode: "KRW-ETH" });
    expect(mocks.useNews).toHaveBeenLastCalledWith({ limit: 100, marketCode: "KRW-ETH" });
    expect(result.current.visibleItems).toHaveLength(10);
  });
});
