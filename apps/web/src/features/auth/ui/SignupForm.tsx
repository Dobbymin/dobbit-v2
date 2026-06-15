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
    <form className='space-y-4' onSubmit={form.handleSubmit((values) => signup.mutate(values))}>
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
        {signup.isError ? <p className='text-sm text-destructive'>{signup.error.message}</p> : null}
        <Button className='w-full' disabled={signup.isPending} type='submit'>
          {signup.isPending ? "가입 중" : "회원가입"}
        </Button>
        <Button asChild className='w-full' type='button' variant='ghost'>
          <Link href={ROUTES_PATH.LOGIN}>로그인으로 돌아가기</Link>
        </Button>
      </Form>
    </form>
  );
};
