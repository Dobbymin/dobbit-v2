"use client";

import Link from "next/link";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, ROUTES_PATH } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useLogin } from "../model";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const login = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className='flex w-full flex-col items-center justify-center gap-6'
        onSubmit={form.handleSubmit((values) => login.mutate(values))}
      >
        <div className='flex w-80 flex-col gap-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl className='grid gap-3'>
                  <Input autoComplete='email' placeholder='you@example.com' type='email' {...field} />
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
                <FormControl className='grid gap-3'>
                  <Input autoComplete='current-password' placeholder='비밀번호' type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {login.isError ? <p className='text-sm text-destructive'>{login.error.message}</p> : null}
        <div className='flex w-80 justify-center gap-4'>
          <Button className='w-full py-5 text-white' disabled={login.isPending} type='submit' variant='secondary'>
            {login.isPending ? "로그인 중" : "로그인"}
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
