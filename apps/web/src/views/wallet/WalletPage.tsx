"use client";

import { useState } from "react";

import { AppLayout } from "@/widgets";

import {
  CashSection,
  ChartAreaSection,
  HeldAssetsListSection,
  StatsAreaSection,
  TabNavigationSection,
  type WalletTab,
  useWalletRealtime,
} from "@/features/wallet";

export default function WalletPage() {
  useWalletRealtime();
  const [activeTab, setActiveTab] = useState<WalletTab>("보유자산");

  return (
    <AppLayout>
      <div className='mx-auto flex w-full max-w-4xl flex-col gap-4 py-4'>
        <TabNavigationSection activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "보유자산" ? (
          <>
            <CashSection />
            <section className='flex w-full gap-4'>
              <StatsAreaSection />
              <ChartAreaSection />
            </section>
            <HeldAssetsListSection />
          </>
        ) : (
          <section className='flex min-h-[300px] w-full items-center justify-center bg-card/20'>
            <p className='text-sm text-muted-foreground'>준비 중입니다.</p>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
