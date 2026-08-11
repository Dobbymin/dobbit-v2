"use client";

import Link from "next/link";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, ROUTES_PATH } from "@/shared";

import { useLoginForm } from "../model";

export const LoginForm = () => {
  const { form, isLoginPending, loginError, submitLogin } = useLoginForm();

  return (
    <Form {...form}>
      <form className='flex w-full flex-col items-center justify-center gap-6' onSubmit={submitLogin}>
        <div className='flex w-80 flex-col gap-4'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>아이디</FormLabel>
                <FormControl>
                  <Input autoComplete='username' placeholder='아이디' type='text' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input autoComplete='current-password' placeholder='비밀번호' type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {loginError ? <p className='text-sm text-destructive'>{loginError.message}</p> : null}
        <div className='flex w-80 justify-center gap-4'>
          <Button className='w-full py-5' disabled={isLoginPending} type='submit' variant='secondary'>
            {isLoginPending ? "로그인 중" : "로그인"}
          </Button>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm'>아직 회원이 아니신가요?</span>
          <Link className='text-base font-bold text-primary/80 hover:underline' href={ROUTES_PATH.SIGNUP}>
            회원가입
          </Link>
        </div>
      </form>
    </Form>
  );
};
