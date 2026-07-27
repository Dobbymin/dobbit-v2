"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSignup } from "./useSignup";

const signupSchema = z.object({
  username: z.string().regex(/^[a-z0-9_]{4,20}$/, "아이디는 영문 소문자, 숫자, 밑줄 4~20자로 입력하세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다.").max(24, "닉네임은 24자 이하여야 합니다."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const useSignupForm = () => {
  const signup = useSignup();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      nickname: "",
    },
  });

  return {
    form,
    submitSignup: form.handleSubmit((values) => signup.mutate(values)),
    isSignupPending: signup.isPending,
    signupError: signup.isError ? signup.error : null,
  };
};
