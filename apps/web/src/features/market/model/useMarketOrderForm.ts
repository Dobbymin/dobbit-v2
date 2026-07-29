"use client";

import { useAuthStore } from "@/shared";
import { TOAST_MESSAGES } from "@/shared/constants";
import { toast } from "sonner";

import { useBuyOrder } from "./useBuyOrder";
import { useOrderValues } from "./useOrderValues";
import { useOrderableCash } from "./useOrderableCash";
import { useSellOrder } from "./useSellOrder";

export const useMarketOrderForm = (marketCode: string) => {
  const orderValues = useOrderValues();
  const accessToken = useAuthStore((state) => state.accessToken);
  const buyOrder = useBuyOrder();
  const sellOrder = useSellOrder();
  const { data: orderableCash = 0 } = useOrderableCash();

  const submitOrder = (mutate: typeof buyOrder.mutate, successMessage: string) => {
    if (!orderValues.isValid) {
      toast.error(TOAST_MESSAGES.ORDER_INVALID_INPUT);
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
          toast.success(successMessage);
          orderValues.reset();
        },
        onError: (error: Error) => {
          toast.error(error.message || TOAST_MESSAGES.ORDER_FAILED);
        },
      },
    );
  };

  const buy = () => submitOrder(buyOrder.mutate, TOAST_MESSAGES.BUY_ORDER_SUCCESS);
  const sell = () => submitOrder(sellOrder.mutate, TOAST_MESSAGES.SELL_ORDER_SUCCESS);

  return {
    ...orderValues,
    accessToken,
    orderableCash,
    isLoading: buyOrder.isPending || sellOrder.isPending,
    buy,
    sell,
  };
};
