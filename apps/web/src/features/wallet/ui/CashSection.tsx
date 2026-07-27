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
} from "@/shared";

import { useCashForm } from "../model";

export const CashSection = () => {
  const {
    changeDepositOpen,
    changeWithdrawOpen,
    depositError,
    depositForm,
    depositOpen,
    isDepositPending,
    isWithdrawPending,
    submitDeposit,
    submitWithdraw,
    withdrawError,
    withdrawForm,
    withdrawOpen,
  } = useCashForm();

  return (
    <section className='flex w-full items-center justify-between bg-card/20 p-5'>
      <p className='text-lg text-foreground'>가상의 현금을 입금해보아요.</p>
      <div className='flex gap-2'>
        <Dialog open={withdrawOpen} onOpenChange={changeWithdrawOpen}>
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
            <form className='space-y-4' onSubmit={submitWithdraw}>
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
                {withdrawError ? <p className='text-sm text-destructive'>{withdrawError.message}</p> : null}
                <DialogFooter>
                  <Button disabled={isWithdrawPending} type='submit'>
                    {isWithdrawPending ? "처리 중" : "출금하기"}
                  </Button>
                </DialogFooter>
              </Form>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={depositOpen} onOpenChange={changeDepositOpen}>
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
            <form className='space-y-4' onSubmit={submitDeposit}>
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
                {depositError ? <p className='text-sm text-destructive'>{depositError.message}</p> : null}
                <DialogFooter>
                  <Button disabled={isDepositPending} type='submit'>
                    {isDepositPending ? "처리 중" : "입금하기"}
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
