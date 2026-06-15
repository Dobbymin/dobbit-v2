import type { NewsListQuery } from "../api";

export const newsKeys = {
  all: ["news"] as const,
  list: (query?: NewsListQuery) => ["news", "list", query ?? {}] as const,
};
