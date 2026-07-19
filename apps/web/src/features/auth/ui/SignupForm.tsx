"use client";

import Link from "next/link";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, ROUTES_PATH } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSignup } from "../model";

const signupSchema = z.object({
  username: z.string().regex(/^[a-z0-9_]{4,20}$/, "아이디는 영문 소문자, 숫자, 밑줄 4~20자로 입력하세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다.").max(24, "닉네임은 24자 이하여야 합니다."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupForm = () => {
  const signup = useSignup();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
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
        {signup.isError ? <p className='text-sm text-destructive'>{signup.error.message}</p> : null}
        <div className='flex w-80 justify-center gap-4'>
          <Button className='w-full py-5' disabled={signup.isPending} type='submit' variant='secondary'>
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
