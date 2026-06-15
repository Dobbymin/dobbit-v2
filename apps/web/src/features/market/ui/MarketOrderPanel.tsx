"use client";

import { useState } from "react";

import { Button, Input, Label, ROUTES_PATH, useAuthStore } from "@/shared";

const ORDER_TABS = ["매수", "매도", "거래내역"] as const;

type OrderTab = (typeof ORDER_TABS)[number];

export const MarketOrderPanel = () => {
  const [selectedTab, setSelectedTab] = useState<OrderTab>("매수");
  const accessToken = useAuthStore((state) => state.accessToken);
  const disabledMessage = accessToken
    ? "거래 API 연결 전까지 주문 실행은 비활성화되어 있습니다."
    : "보호된 거래 기능은 로그인 후 사용할 수 있습니다.";

  return (
    <section className='flex min-h-[300px] flex-col border-t border-white/10 bg-surface-dark/60'>
      <div className='grid max-w-xl grid-cols-3 border-r border-b border-white/10'>
        {ORDER_TABS.map((tab) => (
          <button
            className='h-11 border-r border-white/10 text-sm font-semibold text-text-muted-dark transition-colors last:border-r-0 hover:bg-white/5 hover:text-white data-[active=true]:bg-[#121212] data-[active=true]:text-white'
            data-active={selectedTab === tab}
            key={tab}
            onClick={() => setSelectedTab(tab)}
            type='button'
          >
            {tab}
          </button>
        ))}
      </div>

      {selectedTab === "거래내역" ? (
        <div className='flex flex-1 items-center justify-center p-4 text-center text-sm text-text-muted-dark'>
          public 대시보드에서는 개인 거래내역을 노출하지 않습니다.
        </div>
      ) : (
        <form className='grid flex-1 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]'>
          <div className='space-y-5'>
            <div className='flex items-center justify-between border-b border-white/10 pb-4'>
              <p className='font-semibold text-text-dark'>주문가능</p>
              <p className='text-sm font-semibold text-text-dark'>
                0 <span className='text-xs text-text-muted-dark'>KRW</span>
              </p>
            </div>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='space-y-2'>
                <Label className='text-text-muted-dark' htmlFor='order-price'>
                  가격
                </Label>
                <Input
                  className='border-white/10 bg-[#121212] text-text-dark'
                  disabled
                  id='order-price'
                  placeholder='0'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-text-muted-dark' htmlFor='order-amount'>
                  수량
                </Label>
                <Input
                  className='border-white/10 bg-[#121212] text-text-dark'
                  disabled
                  id='order-amount'
                  placeholder='0.0000'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-text-muted-dark' htmlFor='order-total'>
                  총액
                </Label>
                <Input
                  className='border-white/10 bg-[#121212] text-text-dark'
                  disabled
                  id='order-total'
                  placeholder='0'
                />
              </div>
            </div>
          </div>
          <div className='flex flex-col justify-end gap-3'>
            <p className='text-sm text-text-muted-dark'>{disabledMessage}</p>
            <div className='flex gap-2'>
              <Button
                className='h-10 w-[30%] border-white/10 bg-[#4b5563] text-white hover:bg-[#5b6573]'
                type='button'
                variant='outline'
              >
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
          </div>
        </form>
      )}
    </section>
  );
};
