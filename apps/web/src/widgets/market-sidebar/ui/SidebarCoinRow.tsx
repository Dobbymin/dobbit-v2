"use client";

import Link from "next/link";

import { cn } from "@/shared";

import type { MarketRowData } from "@/features/market";

import { CoinIcon } from "@/entities/market";

type SidebarCoinRowProps = {
  row: MarketRowData;
  rank?: number;
  active?: boolean;
};

export const SidebarCoinRow = ({ row, rank, active = false }: SidebarCoinRowProps) => {
  const tone =
    row.changeTone === "increase"
      ? "text-increase"
      : row.changeTone === "decrease"
        ? "text-decrease"
        : "text-change-neutral";
  const valueTone = row.isActive ? tone : "text-muted-foreground";

  return (
    <Link
      className={cn(
        "grid h-[56px] w-full items-center gap-3 border-l-2 px-4 transition-colors focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
        rank === undefined ? "grid-cols-[auto_minmax(0,1fr)_auto]" : "grid-cols-[16px_auto_minmax(0,1fr)_auto]",
        active ? "border-l-primary bg-surface-sunken" : "border-l-transparent hover:bg-card",
      )}
      href={`/trade/${row.code}`}
    >
      {rank === undefined ? null : (
        <span className='text-center text-xs font-medium text-subtle-foreground tabular-nums'>{rank}</span>
      )}
      <CoinIcon marketCode={row.code} size={28} />
      <span className='min-w-0'>
        <span
          className={cn(
            "line-clamp-2 text-sm leading-tight font-semibold",
            active ? "text-primary" : "text-foreground",
          )}
        >
          {row.koreanName}
        </span>
      </span>
      <span className='flex flex-col items-end'>
        <span className={cn("text-xs font-medium tabular-nums", valueTone)}>{row.tradePrice}</span>
        <span className={cn("text-xs tabular-nums", valueTone)}>{row.changeRate}</span>
      </span>
    </Link>
  );
};
