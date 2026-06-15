"use client";

import Link from "next/link";

import { LogIn, LogOut, Settings, UserPlus } from "lucide-react";

import { useLogout } from "@/features/auth";

import { Button } from "@/shared/components/ui";
import { ROUTES_PATH } from "@/shared/constants";
import { useAuthStore } from "@/shared/store";

export const UserMenuButton = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useLogout();

  if (!accessToken) {
    return (
      <div className='flex flex-wrap items-center gap-2'>
        <Button asChild size='sm' variant='ghost'>
          <Link href={ROUTES_PATH.LOGIN}>
            <LogIn aria-hidden className='size-4' />
            로그인
          </Link>
        </Button>
        <Button asChild size='sm'>
          <Link href={ROUTES_PATH.SIGNUP}>
            <UserPlus aria-hidden className='size-4' />
            회원가입
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button asChild size='sm' variant='ghost'>
        <Link href={ROUTES_PATH.SETTING}>
          <Settings aria-hidden className='size-4' />
          설정
        </Link>
      </Button>
      <Button disabled={logout.isPending} onClick={() => logout.mutate()} size='sm' type='button' variant='outline'>
        <LogOut aria-hidden className='size-4' />
        로그아웃
      </Button>
    </div>
  );
};
