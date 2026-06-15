"use client";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@/shared/components/ui";
import { ROUTES_PATH } from "@/shared/constants";

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
    <form className='space-y-4' onSubmit={form.handleSubmit((values) => login.mutate(values))}>
      <Form {...form}>
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
        {login.isError ? <p className='text-sm text-destructive'>{login.error.message}</p> : null}
        <Button className='w-full' disabled={login.isPending} type='submit'>
          {login.isPending ? "로그인 중" : "로그인"}
        </Button>
        <Button asChild className='w-full' type='button' variant='ghost'>
          <Link href={ROUTES_PATH.SIGNUP}>회원가입</Link>
        </Button>
      </Form>
    </form>
  );
};
