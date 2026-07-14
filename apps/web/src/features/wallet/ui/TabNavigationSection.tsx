"use client";

import { cn } from "@/shared";

export const WALLET_TABS = ["보유자산", "투자손익", "거래내역", "입출금내역"] as const;

export type WalletTab = (typeof WALLET_TABS)[number];

type Props = {
  activeTab: WalletTab;
  setActiveTab: (tab: WalletTab) => void;
};

export const TabNavigationSection = ({ activeTab, setActiveTab }: Props) => {
  return (
    <nav className='flex h-14 w-full border-b border-white/10 bg-card/20'>
      {WALLET_TABS.map((tab) => (
        <button
          key={tab}
          type='button'
          onClick={() => setActiveTab(tab)}
          className={cn(
            "h-full flex-1 text-sm transition-colors",
            activeTab === tab
              ? "border-b-2 border-primary font-semibold text-primary"
              : "text-white hover:underline hover:underline-offset-2",
          )}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};
