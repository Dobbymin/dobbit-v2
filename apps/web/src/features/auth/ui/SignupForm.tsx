"use client";

import Link from "next/link";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, ROUTES_PATH } from "@/shared";

import { useSignupForm } from "../model";

export const SignupForm = () => {
  const { form, isSignupPending, signupError, submitSignup } = useSignupForm();

  return (
    <Form {...form}>
      <form className='flex w-full flex-col items-center justify-center gap-6' onSubmit={submitSignup}>
        <div className='flex w-80 flex-col gap-6'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>아이디</FormLabel>
                <FormControl>
                  <Input autoComplete='username' placeholder='dobbit_user' type='text' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='nickname'
            render={({ field }) => (
              <FormItem>
                <FormLabel>닉네임</FormLabel>
                <FormControl>
                  <Input autoComplete='nickname' placeholder='Dobbit 사용자' {...field} />
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
                  <Input autoComplete='new-password' placeholder='8자 이상' type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {signupError ? <p className='text-sm text-destructive'>{signupError.message}</p> : null}
        <div className='flex w-80 justify-center gap-4'>
          <Button className='w-full py-5' disabled={isSignupPending} type='submit' variant='secondary'>
            {isSignupPending ? "가입 중" : "회원가입"}
          </Button>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm'>이미 가입했다면?</span>
          <Link className='text-base font-bold text-primary hover:underline' href={ROUTES_PATH.LOGIN}>
            로그인
          </Link>
        </div>
      </form>
    </Form>
  );
};
