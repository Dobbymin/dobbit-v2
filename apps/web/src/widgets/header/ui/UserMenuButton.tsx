"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ROUTES_PATH,
} from "@/shared";
import { UserRound, Wallet } from "lucide-react";

import { useLogout } from "@/features/auth";

import { useIsAuth } from "@/shared/store";

export const UserMenuButton = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useIsAuth();
  const logout = useLogout();

  // 로그인하지 않은 경우 Login 링크 표시
  if (!isLoading && !isAuthenticated) {
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

  // 로딩 중이거나 인증된 경우 Wallet 버튼과 Avatar 표시
  return (
    <div className='flex items-center justify-end gap-4'>
      <Link
        href={ROUTES_PATH.WALLET}
        className='rounded-md bg-surface-dark px-3 py-2 text-text-muted-dark transition-colors hover:bg-white/10 hover:text-white'
      >
        <div className='flex items-center gap-2'>
          <Wallet className='size-5' />
          <p className='text-sm font-semibold'>Wallet</p>
        </div>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label='사용자 메뉴'
          className='rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
          disabled={logout.isPending}
        >
          <Avatar>
            <AvatarFallback>
              <UserRound className='size-5' fill='#e0e0e0' />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onSelect={() => router.push(ROUTES_PATH.SETTING)}>Setting</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => logout.mutate()}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
