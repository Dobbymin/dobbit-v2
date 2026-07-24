"use client";

import { HomeNewsPanel, MarketHighlightCarousel, MarketRankingTable } from "@/widgets";

export default function HomePage() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]'>
        <MarketHighlightCarousel />
        <HomeNewsPanel />
      </div>
      <MarketRankingTable />
    </div>
  );
}
