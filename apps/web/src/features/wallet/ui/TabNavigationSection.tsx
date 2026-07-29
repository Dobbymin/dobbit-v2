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
    <nav className='flex h-12 w-full border-b border-border bg-card/20 sm:h-14'>
      {WALLET_TABS.map((tab) => (
        <button
          key={tab}
          type='button'
          onClick={() => setActiveTab(tab)}
          className={cn(
            "h-full flex-1 text-xs whitespace-nowrap transition-colors sm:text-sm",
            activeTab === tab
              ? "border-b-2 border-primary font-semibold text-primary"
              : "text-foreground hover:underline hover:underline-offset-2",
          )}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};
