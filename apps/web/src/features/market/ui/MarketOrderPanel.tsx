"use client";

import { useState } from "react";

import {
  Button,
  Input,
  ROUTES_PATH,
  cn,
  formatPrice,
  formatThousands,
  parseNumericInput,
  parseNumericInputWithDecimal,
  useAuthStore,
} from "@/shared";
import { RotateCw } from "lucide-react";
import { toast } from "sonner";

import { useBuyOrder, useOrderableCash, useSellOrder } from "../model";

import { OrderbookPanel } from "./OrderbookPanel";
import { TradeHistoryPanel } from "./TradeHistoryPanel";

const ORDER_TABS = ["매수", "매도", "거래내역"] as const;

type OrderTab = (typeof ORDER_TABS)[number];

type MarketOrderPanelProps = {
  marketCode: string;
};

export const MarketOrderPanel = ({ marketCode }: MarketOrderPanelProps) => {
  const [selectedTab, setSelectedTab] = useState<OrderTab>("매수");
  const [price, setPrice] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [total, setTotal] = useState<string>("");

  const accessToken = useAuthStore((state) => state.accessToken);
  const coinSymbol = marketCode.replace("KRW-", "");

  const buyOrder = useBuyOrder();
  const sellOrder = useSellOrder();
  const { data: orderableCash = 0 } = useOrderableCash();

  const handlePriceChange = (value: string) => {
    const cleaned = parseNumericInputWithDecimal(value);
    setPrice(cleaned);

    if (cleaned === "" || amount === "" || isNaN(Number(cleaned)) || isNaN(Number(amount))) {
      setTotal("");
    } else {
      setTotal(String(Math.round(Number(cleaned) * Number(amount))));
    }
  };

  const handleAmountChange = (value: string) => {
    const cleaned = parseNumericInputWithDecimal(value);
    setAmount(cleaned);
    if (cleaned === "" || price === "" || isNaN(Number(price)) || isNaN(Number(cleaned))) {
      setTotal("");
    } else {
      setTotal(String(Math.round(Number(price) * Number(cleaned))));
    }
  };

  const handleTotalChange = (value: string) => {
    const cleaned = parseNumericInput(value);
    const numValue = cleaned === "" ? "" : String(Number(cleaned));
    setTotal(numValue);
    if (numValue === "" || price === "" || Number(price) <= 0) {
      setAmount("");
    } else {
      setAmount(String(Number(numValue) / Number(price)));
    }
  };

  const handleSelectOrderbookPrice = (selectedPrice: number) => {
    // 거래내역 탭에서는 주문 폼이 보이지 않으므로 매수 탭으로 전환한다.
    if (selectedTab === "거래내역") {
      setSelectedTab("매수");
    }
    handlePriceChange(String(selectedPrice));
  };

  const handleReset = () => {
    setPrice("");
    setAmount("");
    setTotal("");
  };

  const isValidOrder = () => {
    return Number.isFinite(Number(price)) && Number(price) > 0 && Number.isFinite(Number(amount)) && Number(amount) > 0;
  };

  const handleBuyOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidOrder()) {
      toast.error("가격과 수량을 올바르게 입력해주세요.");
      return;
    }

    buyOrder.mutate(
      {
        marketCode,
        price: Number(price),
        quantity: Number(amount),
      },
      {
        onSuccess: () => {
          toast.success("주문이 체결되었습니다.");
          handleReset();
        },
        onError: (error: Error) => {
          toast.error(error.message || "주문에 실패했습니다.");
        },
      },
    );
  };

  const handleSellOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidOrder()) {
      toast.error("가격과 수량을 올바르게 입력해주세요.");
      return;
    }

    sellOrder.mutate(
      {
        marketCode,
        price: Number(price),
        quantity: Number(amount),
      },
      {
        onSuccess: () => {
          toast.success("주문이 체결되었습니다.");
          handleReset();
        },
        onError: (error: Error) => {
          toast.error(error.message || "주문에 실패했습니다.");
        },
      },
    );
  };

  const isLoading = buyOrder.isPending || sellOrder.isPending;

  return (
    <section className='relative flex shrink-0 min-h-[300px] w-full border-t border-border bg-background'>
      <aside className='hidden w-[40%] shrink-0 border-r border-border md:block'>
        <OrderbookPanel marketCode={marketCode} onSelectPrice={handleSelectOrderbookPrice} />
      </aside>
      <div className='flex min-h-0 min-w-0 flex-1 flex-col md:absolute md:inset-y-0 md:right-0 md:w-[60%]'>
        <nav className='flex h-14 w-full border-b border-border'>
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
                  onChange={(event) => handlePriceChange(event.target.value)}
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
                  onChange={(event) => handleAmountChange(event.target.value)}
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
                  onChange={(event) => handleTotalChange(event.target.value)}
                  placeholder='0'
                  type='text'
                  value={total === "" ? "" : formatThousands(String(total))}
                />
              </div>
            </div>
            <div className='flex w-full gap-2 pt-2'>
              <Button
                className='h-10 w-[25%]'
                disabled={isLoading}
                onClick={handleReset}
                type='button'
                variant='outline'
              >
                <RotateCw className='size-4' />
                초기화
              </Button>
              {accessToken ? (
                <Button
                  className='h-10 flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50'
                  disabled={isLoading || !isValidOrder()}
                  type='submit'
                >
                  {isLoading ? "처리 중..." : "주문하기"}
                </Button>
              ) : (
                <Button asChild className='h-10 flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90'>
                  <a href={`${ROUTES_PATH.LOGIN}?from=${ROUTES_PATH.WALLET}`}>주문하기</a>
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
