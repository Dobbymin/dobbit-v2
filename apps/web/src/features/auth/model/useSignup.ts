"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { ROUTES_PATH } from "@/shared/constants";
import { useAuthStore } from "@/shared/store";

import { signupApi, type SignupRequest } from "../api";

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
