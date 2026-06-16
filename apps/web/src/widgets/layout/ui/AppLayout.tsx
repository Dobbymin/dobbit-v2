import type { PropsWithChildren } from "react";

import { Header } from "@/widgets/header";

export const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Header />
      <main className='mx-auto w-full max-w-6xl px-4 py-6'>{children}</main>
    </div>
  );
};
