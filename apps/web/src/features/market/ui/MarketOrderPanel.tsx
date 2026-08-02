"use client";

import Link from "next/link";

import { useState } from "react";

import { calculateTradeFee } from "@dobbit/shared";
import { Button, Input, ROUTES_PATH, cn, formatPrice, formatThousands } from "@/shared";
import { RotateCw } from "lucide-react";

import { useMarketOrderForm } from "../model";

import { OrderbookPanel } from "./OrderbookPanel";
import { TradeHistoryPanel } from "./TradeHistoryPanel";

const ORDER_TABS = ["매수", "매도", "거래내역"] as const;

type OrderTab = (typeof ORDER_TABS)[number];

type MarketOrderPanelProps = {
  marketCode: string;
};

export const MarketOrderPanel = ({ marketCode }: MarketOrderPanelProps) => {
  const [selectedTab, setSelectedTab] = useState<OrderTab>("매수");
  const {
    price,
    amount,
    total,
    isValid,
    accessToken,
    orderableCash,
    isLoading,
    changePrice,
    changeAmount,
    changeTotal,
    reset,
    buy,
    sell,
  } = useMarketOrderForm(marketCode);
  const coinSymbol = marketCode.replace("KRW-", "");
  const orderTotal = Number(total) || 0;
  const fee = calculateTradeFee(orderTotal);

  const handleSelectOrderbookPrice = (selectedPrice: number) => {
    // 거래내역 탭에서는 주문 폼이 보이지 않으므로 매수 탭으로 전환한다.
    if (selectedTab === "거래내역") {
      setSelectedTab("매수");
    }
    changePrice(String(selectedPrice));
  };

  const handleBuyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    buy();
  };

  const handleSellOrder = (e: React.FormEvent) => {
    e.preventDefault();
    sell();
  };

  return (
    <section className='relative flex min-h-[300px] w-full shrink-0 border-t border-border bg-background'>
      <aside className='hidden w-[40%] shrink-0 border-r border-border md:block'>
        <OrderbookPanel marketCode={marketCode} onSelectPrice={handleSelectOrderbookPrice} />
      </aside>
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col md:w-[60%]",
          selectedTab === "거래내역" && "md:absolute md:inset-y-0 md:right-0",
        )}
      >
        <nav className='flex h-14 w-full shrink-0 border-b border-border'>
          {ORDER_TABS.map((tab) => (
            <button
              className={cn(
                "h-full flex-1 text-sm transition-colors",
                selectedTab === tab
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
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
          <TradeHistoryPanel />
        ) : (
          <form
            className='flex w-full flex-col gap-3 p-5'
            onSubmit={selectedTab === "매수" ? handleBuyOrder : handleSellOrder}
          >
            <div className='flex items-center justify-between border-b border-border pb-4'>
              <p className='text-sm text-muted-foreground'>주문가능</p>
              <p className='text-sm font-semibold text-foreground tabular-nums'>
                {accessToken ? formatPrice(orderableCash) : 0}{" "}
                <span className='text-xs text-muted-foreground'>KRW</span>
              </p>
            </div>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-3'>
                <label className='flex w-25 items-center gap-1 text-sm' htmlFor='order-price'>
                  <span>가격</span>
                  <span className='text-[10px] font-medium text-muted-foreground'>(KRW)</span>
                </label>
                <Input
                  className='border-none bg-background text-right text-foreground tabular-nums'
                  disabled={isLoading}
                  id='order-price'
                  inputMode='numeric'
                  onChange={(event) => changePrice(event.target.value)}
                  placeholder='0'
                  type='text'
                  value={price === "" ? "" : formatThousands(String(price))}
                />
              </div>
              <div className='flex items-center gap-3'>
                <label className='flex w-25 items-center gap-1 text-sm' htmlFor='order-amount'>
                  <span>수량</span>
                  <span className='text-[10px] font-medium text-muted-foreground'>({coinSymbol})</span>
                </label>
                <Input
                  className='border-none bg-background text-right text-foreground tabular-nums'
                  disabled={isLoading}
                  id='order-amount'
                  inputMode='decimal'
                  onChange={(event) => changeAmount(event.target.value)}
                  placeholder='0.0000'
                  type='text'
                  value={amount}
                />
              </div>
              <div className='flex items-center gap-3'>
                <label className='flex w-25 items-center gap-1 text-sm' htmlFor='order-total'>
                  <span>총액</span>
                  <span className='text-[10px] font-medium text-muted-foreground'>(KRW)</span>
                </label>
                <Input
                  className='border-none bg-background text-right text-foreground tabular-nums'
                  disabled={isLoading}
                  id='order-total'
                  inputMode='numeric'
                  onChange={(event) => changeTotal(event.target.value)}
                  placeholder='0'
                  type='text'
                  value={total === "" ? "" : formatThousands(String(total))}
                />
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>{selectedTab === "매수" ? "총 주문금액" : "총 정산금액"}</p>
              <div className='text-right'>
                <p className='text-sm font-semibold text-foreground tabular-nums'>
                  {formatPrice(selectedTab === "매수" ? orderTotal + fee : orderTotal - fee)} KRW
                </p>
                <p className='text-xs text-muted-foreground tabular-nums'>수수료 0.05% · {formatPrice(fee)} KRW</p>
              </div>
            </div>
            <div className='flex w-full gap-2 pt-2'>
              <Button className='h-10 w-[25%]' disabled={isLoading} onClick={reset} type='button' variant='outline'>
                <RotateCw className='size-4' />
                초기화
              </Button>
              {accessToken ? (
                <Button
                  className='h-10 flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50'
                  disabled={isLoading || !isValid}
                  type='submit'
                >
                  {isLoading ? "처리 중..." : "주문하기"}
                </Button>
              ) : (
                <Button asChild className='h-10 flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90'>
                  <Link href={`${ROUTES_PATH.LOGIN}?from=${ROUTES_PATH.WALLET}`}>주문하기</Link>
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
