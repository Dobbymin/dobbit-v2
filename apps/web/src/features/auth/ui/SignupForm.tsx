"use client";

import Link from "next/link";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, ROUTES_PATH } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSignup } from "../model";

const signupSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다.").max(24, "닉네임은 24자 이하여야 합니다."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupForm = () => {
  const signup = useSignup();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      nickname: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className='flex w-full flex-col items-center justify-center gap-6'
        onSubmit={form.handleSubmit((values) => signup.mutate(values))}
      >
        <div className='flex w-80 flex-col gap-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input autoComplete='email' placeholder='you@example.com' type='email' {...field} />
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
        {signup.isError ? <p className='text-sm text-destructive'>{signup.error.message}</p> : null}
        <div className='flex w-80 justify-center gap-4'>
          <Button className='w-full py-5 text-white' disabled={signup.isPending} type='submit' variant='secondary'>
            {signup.isPending ? "가입 중" : "회원가입"}
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
