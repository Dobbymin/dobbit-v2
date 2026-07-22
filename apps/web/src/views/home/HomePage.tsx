"use client";

import { HomeNewsPanel, MarketHighlightCarousel, MarketRankingTable } from "@/widgets";

export default function HomePage() {
  return (
    <div className='space-y-6'>
      <MarketHighlightCarousel />
      <MarketRankingTable />
      <HomeNewsPanel />
    </div>
  );
}
