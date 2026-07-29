"use client";

import { useState } from "react";

import {
  CashHistorySection,
  CashSection,
  ChartAreaSection,
  HeldAssetsListSection,
  InvestmentProfitSection,
  StatsAreaSection,
  TabNavigationSection,
  TradeHistorySection,
  type WalletTab,
  useWalletRealtime,
} from "@/features/wallet";

export default function WalletPage() {
  useWalletRealtime();
  const [activeTab, setActiveTab] = useState<WalletTab>("보유자산");

  const tabContent = {
    보유자산: (
      <>
        <CashSection />
        <section className='flex w-full flex-col gap-4 lg:flex-row'>
          <StatsAreaSection />
          <ChartAreaSection />
        </section>
        <HeldAssetsListSection />
      </>
    ),
    투자손익: <InvestmentProfitSection />,
    거래내역: <TradeHistorySection />,
    입출금내역: <CashHistorySection />,
  } satisfies Record<WalletTab, React.ReactNode>;

  return (
    <div className='px-4 pb-6 lg:px-10'>
      <div className='mx-auto flex w-full max-w-4xl flex-col gap-4 py-4'>
        <TabNavigationSection activeTab={activeTab} setActiveTab={setActiveTab} />
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
