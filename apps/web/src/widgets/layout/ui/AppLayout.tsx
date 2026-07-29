import type { PropsWithChildren } from "react";

import { Header } from "@/widgets/header";
import { MarketSidebar } from "@/widgets/market-sidebar";

export const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Header />
      <div className='flex'>
        <main className='min-w-0 flex-1 pt-[52px]'>{children}</main>
        <MarketSidebar />
      </div>
    </div>
  );
};
