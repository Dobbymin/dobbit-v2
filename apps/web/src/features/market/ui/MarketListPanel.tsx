"use client";

import { Input, cn } from "@/shared";
import type { Market } from "@dobbit/shared";

import { toMarketRow, useMarketTickers } from "../model";

type MarketListPanelProps = {
  markets: Market[];
  selectedMarketCode: string;
  searchKeyword: string;
  isLoading: boolean;
  onSearchKeywordChange: (value: string) => void;
  onSelectMarket: (marketCode: string) => void;
};

type MarketDisplayRow = {
  code: string;
  koreanName: string;
  symbolPair: string;
  tradePrice: string;
  changeRate: string;
  changeTone: "increase" | "decrease";
  isActive: boolean;
};

const fallbackRows: MarketDisplayRow[] = [
  {
    code: "KRW-BTC",
    koreanName: "비트코인",
    symbolPair: "BTC/KRW",
    tradePrice: "98,501,000",
    changeRate: "-0.69%",
    changeTone: "decrease",
    isActive: true,
  },
  {
    code: "KRW-WAXP",
    koreanName: "왁스",
    symbolPair: "WAXP/KRW",
    tradePrice: "24.42",
    changeRate: "+5.41%",
    changeTone: "increase",
    isActive: true,
  },
  {
    code: "KRW-XRP",
    koreanName: "리플",
    symbolPair: "XRP/KRW",
    tradePrice: "2,927",
    changeRate: "-1.24%",
    changeTone: "decrease",
    isActive: true,
  },
  {
    code: "KRW-ETH",
    koreanName: "이더리움",
    symbolPair: "ETH/KRW",
    tradePrice: "4,783,000",
    changeRate: "+1.18%",
    changeTone: "increase",
    isActive: true,
  },
  {
    code: "KRW-SOL",
    koreanName: "솔라나",
    symbolPair: "SOL/KRW",
    tradePrice: "211,400",
    changeRate: "-2.36%",
    changeTone: "decrease",
    isActive: true,
  },
];

export const MarketListPanel = ({
  markets,
  selectedMarketCode,
  searchKeyword,
  isLoading,
  onSearchKeywordChange,
  onSelectMarket,
}: MarketListPanelProps) => {
  // Subscribe to real-time tickers for all markets
  const tickers = useMarketTickers(markets.length > 0 ? markets.map((m) => m.code) : []);

  const rows: MarketDisplayRow[] =
    markets.length > 0
      ? markets.map((market) => {
          const tickerData = tickers[market.code];
          return toMarketRow(market, tickerData);
        })
      : fallbackRows;

  const filteredRows = rows.filter((row) => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      row.code.toLowerCase().includes(keyword) ||
      row.koreanName.toLowerCase().includes(keyword) ||
      row.symbolPair.toLowerCase().includes(keyword)
    );
  });

  return (
    <aside className='flex min-h-[520px] flex-col border-r border-white/10 bg-surface-dark/60 lg:min-h-[calc(100vh-80px)]'>
      <div className='border-b border-white/10 p-4'>
        <Input
          aria-label='마켓 검색'
          className='h-10 rounded-md border-white/10 bg-[#121212] text-sm text-text-dark placeholder:text-text-muted-dark focus-visible:ring-primary/50'
          onChange={(event) => onSearchKeywordChange(event.target.value)}
          placeholder='코인명 / 심볼 검색'
          value={searchKeyword}
        />
        {isLoading ? (
          <span aria-live='polite' className='sr-only'>
            마켓 동기화 중
          </span>
        ) : null}
      </div>
      <div className='grid grid-cols-[minmax(0,1fr)_88px_72px] gap-3 border-b border-white/10 px-4 py-3 text-xs font-semibold text-text-muted-dark'>
        <span>마켓</span>
        <span className='text-right'>현재가</span>
        <span className='text-right'>변동률</span>
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {filteredRows.length === 0 ? (
          <p className='px-4 py-8 text-sm text-text-muted-dark'>검색 결과가 없습니다.</p>
        ) : (
          filteredRows.map((row) => {
            const active = row.code === selectedMarketCode;

            return (
              <button
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
                  active && "bg-white/[0.06]",
                )}
                key={row.code}
                onClick={() => onSelectMarket(row.code)}
                type='button'
              >
                <span className='min-w-0'>
                  <span className={cn("block truncate text-sm font-semibold", active && "text-white")}>
                    {row.koreanName}
                  </span>
                  <span className='mt-1 block truncate text-xs text-text-muted-dark'>{row.symbolPair}</span>
                </span>
                <span className='text-right text-xs font-medium text-text-dark'>{row.tradePrice}</span>
                <span
                  className={cn(
                    "text-right text-xs",
                    row.isActive
                      ? row.changeTone === "increase"
                        ? "text-increase"
                        : "text-decrease"
                      : "text-text-muted-dark",
                  )}
                >
                  {row.changeRate}
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
