"use client";

import { useAuthStore } from "@/shared";
import { toast } from "sonner";

import { useBuyOrder } from "./useBuyOrder";
import { useOrderableCash } from "./useOrderableCash";
import { useOrderValues } from "./useOrderValues";
import { useSellOrder } from "./useSellOrder";

const INVALID_ORDER_MESSAGE = "가격과 수량을 올바르게 입력해주세요.";
const ORDER_SUCCESS_MESSAGE = "주문이 체결되었습니다.";
const ORDER_FAILURE_MESSAGE = "주문에 실패했습니다.";

export const useMarketOrderForm = (marketCode: string) => {
  const orderValues = useOrderValues();
  const accessToken = useAuthStore((state) => state.accessToken);
  const buyOrder = useBuyOrder();
  const sellOrder = useSellOrder();
  const { data: orderableCash = 0 } = useOrderableCash();

  const submitOrder = (mutate: typeof buyOrder.mutate) => {
    if (!orderValues.isValid) {
      toast.error(INVALID_ORDER_MESSAGE);
      return;
    }

    mutate(
      {
        marketCode,
        price: Number(orderValues.price),
        quantity: Number(orderValues.amount),
      },
      {
        onSuccess: () => {
          toast.success(ORDER_SUCCESS_MESSAGE);
          orderValues.reset();
        },
        onError: (error: Error) => {
          toast.error(error.message || ORDER_FAILURE_MESSAGE);
        },
      },
    );
  };

  const buy = () => submitOrder(buyOrder.mutate);
  const sell = () => submitOrder(sellOrder.mutate);

  return {
    ...orderValues,
    accessToken,
    orderableCash,
    isLoading: buyOrder.isPending || sellOrder.isPending,
    buy,
    sell,
  };
};
