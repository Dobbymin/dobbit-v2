"use client";

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
  formatPrice,
} from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useDeposit, useWalletSummary } from "../model";

const depositSchema = z.object({
  amount: z.coerce.number().positive("입금액은 0보다 커야 합니다."),
});

type DepositFormInput = z.input<typeof depositSchema>;
type DepositFormValues = z.output<typeof depositSchema>;

export const CashSection = () => {
  const summary = useWalletSummary();
  const deposit = useDeposit();
  const form = useForm<DepositFormInput, unknown, DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const submitDeposit = (values: DepositFormValues) => {
    deposit.mutate(values, {
      onSuccess: () => {
        form.reset({ amount: 0 });
      },
    });
  };

  return (
    <section className='rounded-lg border bg-card p-5'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h2 className='text-base font-semibold'>현금 잔고</h2>
          <p className='mt-2 text-2xl font-semibold'>
            {summary.isLoading ? "불러오는 중" : formatPrice(summary.data?.cashBalance ?? 0)}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button type='button'>입금</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>현금 입금</DialogTitle>
              <DialogDescription>모의 투자에 사용할 현금을 입금합니다.</DialogDescription>
            </DialogHeader>
            <form className='space-y-4' onSubmit={form.handleSubmit(submitDeposit)}>
              <Form {...form}>
                <FormField
                  control={form.control}
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
