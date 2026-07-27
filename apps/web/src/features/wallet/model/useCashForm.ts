"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useDeposit } from "./useDeposit";
import { useWithdraw } from "./useWithdraw";

const depositSchema = z.object({
  amount: z.coerce.number().positive("입금액은 0보다 커야 합니다."),
});

const withdrawSchema = z.object({
  amount: z.coerce.number().positive("출금액은 0보다 커야 합니다."),
});

type DepositFormInput = z.input<typeof depositSchema>;
type DepositFormValues = z.output<typeof depositSchema>;
type WithdrawFormInput = z.input<typeof withdrawSchema>;
type WithdrawFormValues = z.output<typeof withdrawSchema>;

export const useCashForm = () => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const depositForm = useForm<DepositFormInput, unknown, DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amount: 0 },
  });
  const withdrawForm = useForm<WithdrawFormInput, unknown, WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: 0 },
  });

  const submitDeposit = depositForm.handleSubmit((values) => {
    deposit.mutate(values, {
      onSuccess: () => {
        depositForm.reset({ amount: 0 });
        setDepositOpen(false);
      },
    });
  });

  const submitWithdraw = withdrawForm.handleSubmit((values) => {
    withdraw.mutate(values, {
      onSuccess: () => {
        withdrawForm.reset({ amount: 0 });
        setWithdrawOpen(false);
      },
    });
  });

  return {
    depositForm,
    withdrawForm,
    depositOpen,
    withdrawOpen,
    changeDepositOpen: setDepositOpen,
    changeWithdrawOpen: setWithdrawOpen,
    submitDeposit,
    submitWithdraw,
    isDepositPending: deposit.isPending,
    isWithdrawPending: withdraw.isPending,
    depositError: deposit.isError ? deposit.error : null,
    withdrawError: withdraw.isError ? withdraw.error : null,
  };
};
