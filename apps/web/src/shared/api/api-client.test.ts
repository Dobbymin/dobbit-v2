import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "./api-client";

describe("apiClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns undefined for a 204 response with an empty body", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { headers: { "Content-Length": "0" }, status: 204 }));

    await expect(apiClient<void>("/favorites", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("returns undefined for a successful response with an empty body", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 200 }));

    await expect(apiClient<void>("/favorites", { method: "POST" })).resolves.toBeUndefined();
  });

  it("parses a successful JSON response", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ marketCode: "KRW-BTC" }), { status: 200 }));

    await expect(apiClient<{ marketCode: string }>("/favorites")).resolves.toEqual({ marketCode: "KRW-BTC" });
  });

  it("uses the JSON message for error responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Favorite already exists" }), { status: 400 }),
    );

    await expect(apiClient("/favorites")).rejects.toThrow("Favorite already exists");
  });

  it("uses the HTTP status for error responses with an empty body", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 400 }));

    await expect(apiClient("/favorites")).rejects.toThrow("HTTP 400");
  });
});
