"use client";

import { useCallback, useEffect, useRef } from "react";

export const useIntersectionObserver = (callback: () => void): React.RefCallback<HTMLDivElement> => {
  const callbackRef = useRef(callback);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node) {
      observerRef.current = null;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          callbackRef.current();
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(node);
    observerRef.current = observer;
  }, []);
};
