import type { PropsWithChildren } from "react";

import { FavoriteSidebar } from "@/widgets/favorite-sidebar";
import { Header } from "@/widgets/header";

type AppLayoutProps = PropsWithChildren<{
  noMainPadding?: boolean;
}>;

export const AppLayout = ({ children, noMainPadding = false }: AppLayoutProps) => {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Header />
      <div className='box-border flex min-h-screen pt-[52px]'>
        <main className={`min-w-0 flex-1 ${noMainPadding ? "" : "px-4 py-6 lg:px-10"}`}>{children}</main>
        <FavoriteSidebar />
      </div>
    </div>
  );
};
