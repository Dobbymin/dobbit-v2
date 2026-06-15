"use client";

import { useRouter } from "next/navigation";

import { ROUTES_PATH, useAuthStore } from "@/shared";
import { useMutation } from "@tanstack/react-query";

import { type SignupRequest, signupApi } from "../api";

export const useSignup = () => {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: (request: SignupRequest) => signupApi(request),
    onSuccess: (response) => {
      setAccessToken(response.accessToken);
      router.push(ROUTES_PATH.HOME);
    },
  });
};
