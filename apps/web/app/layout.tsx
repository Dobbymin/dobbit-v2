import type { ReactNode } from "react";

import type { Metadata } from "next";

import { AppProviders } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dobbit",
  description: "Dobbit web application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='ko'>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
