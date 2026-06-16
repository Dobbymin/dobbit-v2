"use client";

import { type PropsWithChildren } from "react";

import { Toaster } from "@/shared";

import { AuthInitializer, QueryProvider } from "./components";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <AuthInitializer />
      {children}
      <Toaster richColors position='top-center' />
    </QueryProvider>
  );
};
