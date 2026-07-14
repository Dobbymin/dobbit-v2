"use client";

import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useDeposit, useWithdraw } from "../model";

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

export const CashSection = () => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const deposit = useDeposit();
  const withdraw = useWithdraw();

  const depositForm = useForm<DepositFormInput, unknown, DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const withdrawForm = useForm<WithdrawFormInput, unknown, WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const submitDeposit = (values: DepositFormValues) => {
    deposit.mutate(values, {
      onSuccess: () => {
        depositForm.reset({ amount: 0 });
        setDepositOpen(false);
      },
    });
  };

  const submitWithdraw = (values: WithdrawFormValues) => {
    withdraw.mutate(values, {
      onSuccess: () => {
        withdrawForm.reset({ amount: 0 });
        setWithdrawOpen(false);
      },
    });
  };

  return (
    <section className='flex w-full items-center justify-between bg-card/20 p-5'>
      <p className='text-lg text-foreground'>가상의 현금을 입금해보아요.</p>
      <div className='flex gap-2'>
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger asChild>
            <Button className='h-10 w-30' type='button' variant='outline'>
              KRW출금
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>현금 출금</DialogTitle>
              <DialogDescription>모의 투자 계정에서 현금을 출금합니다.</DialogDescription>
            </DialogHeader>
            <form className='space-y-4' onSubmit={withdrawForm.handleSubmit(submitWithdraw)}>
              <Form {...withdrawForm}>
                <FormField
                  control={withdrawForm.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>출금액</FormLabel>
                      <FormControl>
                        <Input
                          inputMode='numeric'
                          min={0}
                          step={1000}
                          type='number'
                          {...field}
                          value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {withdraw.isError ? <p className='text-sm text-destructive'>{withdraw.error.message}</p> : null}
                <DialogFooter>
                  <Button disabled={withdraw.isPending} type='submit'>
                    {withdraw.isPending ? "처리 중" : "출금하기"}
                  </Button>
                </DialogFooter>
              </Form>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Button className='h-10 w-30' type='button'>
              KRW입금
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>현금 입금</DialogTitle>
              <DialogDescription>모의 투자에 사용할 현금을 입금합니다.</DialogDescription>
            </DialogHeader>
            <form className='space-y-4' onSubmit={depositForm.handleSubmit(submitDeposit)}>
              <Form {...depositForm}>
                <FormField
                  control={depositForm.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>입금액</FormLabel>
                      <FormControl>
                        <Input
                          inputMode='numeric'
                          min={0}
                          step={1000}
                          type='number'
                          {...field}
                          value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {deposit.isError ? <p className='text-sm text-destructive'>{deposit.error.message}</p> : null}
                <DialogFooter>
                  <Button disabled={deposit.isPending} type='submit'>
                    {deposit.isPending ? "처리 중" : "입금하기"}
                  </Button>
                </DialogFooter>
              </Form>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
