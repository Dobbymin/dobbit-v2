"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useLogin } from "./useLogin";

const loginSchema = z.object({
  username: z.string().regex(/^[a-z0-9_]{4,20}$/, "아이디는 영문 소문자, 숫자, 밑줄 4~20자로 입력하세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const login = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return {
    form,
    submitLogin: form.handleSubmit((values) => login.mutate(values)),
    isLoginPending: login.isPending,
    loginError: login.isError ? login.error : null,
  };
};
