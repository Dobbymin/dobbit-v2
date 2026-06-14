"use client";

import { QueryProvider } from "./QueryProvider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <QueryProvider>{children}</QueryProvider>;
};
