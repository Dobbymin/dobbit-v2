"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dobbit:recently-viewed";
const CHANGED_EVENT = "dobbit:recently-viewed-changed";
const MAX_ITEMS = 20;

const readCodes = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
};

export const useRecentlyViewed = () => {
  const [codes, setCodes] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setCodes(readCodes());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGED_EVENT, sync);
    };
  }, []);

  const record = useCallback((code: string) => {
    if (typeof window === "undefined") return;
    const next = [code, ...readCodes().filter((item) => item !== code)].slice(0, MAX_ITEMS);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(CHANGED_EVENT));
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, []);

  return { codes, record };
};
