"use client";

import { useState } from "react";

import { Button, Input, ROUTES_PATH, cn, useAuthStore } from "@/shared";
import { RotateCw } from "lucide-react";

import { OrderbookPanel } from "./OrderbookPanel";

const ORDER_TABS = ["매수", "매도", "거래내역"] as const;

type OrderTab = (typeof ORDER_TABS)[number];

type MarketOrderPanelProps = {
  marketCode: string;
};

export const MarketOrderPanel = ({ marketCode }: MarketOrderPanelProps) => {
  const [selectedTab, setSelectedTab] = useState<OrderTab>("매수");
  const [price, setPrice] = useState<number | string>("");
  const [amount, setAmount] = useState<number | string>("");
  const [total, setTotal] = useState<number | string>("");
  const accessToken = useAuthStore((state) => state.accessToken);
  const coinSymbol = marketCode.replace("KRW-", "");

  const handlePriceChange = (value: string) => {
    setPrice(value === "" ? "" : Number(value));
    if (value === "" || amount === "") {
      setTotal("");
    } else {
      setTotal(Number(value) * Number(amount));
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value === "" ? "" : Number(value));
    if (value === "" || price === "") {
      setTotal("");
    } else {
      setTotal(Number(price) * Number(value));
    }
  };

  const handleTotalChange = (value: string) => {
    setTotal(value === "" ? "" : Number(value));
    if (value === "" || price === "" || Number(price) <= 0) {
      setAmount("");
    } else {
      setAmount(Number(value) / Number(price));
    }
  };

  const handleReset = () => {
    setPrice("");
    setAmount("");
    setTotal("");
  };

  return (
    <section className='flex min-h-[300px] w-full border-t border-white/10 bg-surface-dark/60'>
      <aside className='hidden w-[40%] shrink-0 overflow-y-auto border-r border-white/10 md:block'>
        <OrderbookPanel marketCode={marketCode} />
      </aside>
      <div className='flex min-w-0 flex-1 flex-col'>
        <nav className='flex h-14 w-full border-b border-white/10 bg-surface-dark/20'>
          {ORDER_TABS.map((tab) => (
            <button
              className={cn(
                "h-full flex-1 text-sm transition-colors",
                selectedTab === tab
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "text-white hover:underline hover:underline-offset-2",
              )}
              key={tab}
              onClick={() => setSelectedTab(tab)}
              type='button'
            >
              {tab}
            </button>
          ))}
        </nav>

        {selectedTab === "거래내역" ? (
          <div className='flex flex-1 items-center justify-center p-4 text-center text-sm text-text-muted-dark'>
            public 대시보드에서는 개인 거래내역을 노출하지 않습니다.
          </div>
        ) : (
          <form className='flex w-full flex-col gap-3 p-5'>
            <div className='flex items-center justify-between border-b border-white/10 pb-4'>
              <p className='font-semibold text-text-dark'>주문가능</p>
              <p className='text-sm font-semibold text-text-dark'>
                0 <span className='text-xs text-text-muted-dark'>KRW</span>
              </p>
            </div>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-3'>
                <label className='flex w-25 items-center gap-1 text-sm' htmlFor='order-price'>
                  <span>가격</span>
                  <span className='text-[10px] font-bold text-text-dark'>(KRW)</span>
                </label>
                <Input
                  className='border-none bg-[#121212] text-text-dark'
                  id='order-price'
                  onChange={(event) => handlePriceChange(event.target.value)}
                  placeholder='0'
                  type='number'
                  value={price}
                />
              </div>
              <div className='flex items-center gap-3'>
                <label className='flex w-25 items-center gap-1 text-sm' htmlFor='order-amount'>
                  <span>수량</span>
                  <span className='text-[10px] font-bold text-text-dark'>({coinSymbol})</span>
                </label>
                <Input
                  className='border-none bg-[#121212] text-text-dark'
                  id='order-amount'
                  onChange={(event) => handleAmountChange(event.target.value)}
                  placeholder='0.0000'
                  type='number'
                  value={amount}
                />
              </div>
              <div className='flex items-center gap-3'>
                <label className='flex w-25 items-center gap-1 text-sm' htmlFor='order-total'>
                  <span>총액</span>
                  <span className='text-[10px] font-bold text-text-dark'>(KRW)</span>
                </label>
                <Input
                  className='border-none bg-[#121212] text-text-dark'
                  id='order-total'
                  onChange={(event) => handleTotalChange(event.target.value)}
                  placeholder='0'
                  type='number'
                  value={total}
                />
              </div>
            </div>
            <div className='flex w-full gap-2 pt-2'>
              <Button
                className='h-10 w-[25%] border-none bg-[#4b5563] text-white hover:bg-[#5b6573]'
                onClick={handleReset}
                type='button'
                variant='outline'
              >
                <RotateCw className='size-4' />
                초기화
              </Button>
              <Button
                asChild={!accessToken}
                className='h-10 flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90'
                disabled={Boolean(accessToken)}
                type='button'
              >
                {accessToken ? (
                  <span>주문하기</span>
                ) : (
                  <a href={`${ROUTES_PATH.LOGIN}?from=${ROUTES_PATH.WALLET}`}>주문하기</a>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
