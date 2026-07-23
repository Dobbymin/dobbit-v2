import type { PropsWithChildren } from "react";

import { Header } from "@/widgets/header";

type AppLayoutProps = PropsWithChildren<{
  noMainPadding?: boolean;
}>;

export const AppLayout = ({ children, noMainPadding = false }: AppLayoutProps) => {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Header />
      <main className={`min-w-0 pt-[52px] ${noMainPadding ? "" : "px-4 py-6 lg:px-10"}`}>{children}</main>
    </div>
  );
};
