"use client";

import Link from "next/link";

import { Button, ROUTES_PATH, useAuthStore } from "@/shared";

import { useLogout } from "@/features/auth";

export const UserMenuButton = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useLogout();

  if (!accessToken) {
    return (
      <div className='flex items-center justify-end'>
        <Link
          className='text-sm font-semibold text-white transition-colors hover:text-primary'
          href={ROUTES_PATH.LOGIN}
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-end gap-5'>
      <Link
        className='text-sm font-semibold text-text-muted-dark transition-colors hover:text-white'
        href={ROUTES_PATH.WALLET}
      >
        Wallet
      </Link>
      <Link
        className='text-sm font-semibold text-text-muted-dark transition-colors hover:text-white'
        href={ROUTES_PATH.SETTING}
      >
        Setting
      </Link>
      <Button
        className='h-auto border-0 bg-transparent p-0 text-sm font-semibold text-text-muted-dark shadow-none hover:bg-transparent hover:text-white'
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
        type='button'
        variant='ghost'
      >
        Logout
      </Button>
    </div>
  );
};
