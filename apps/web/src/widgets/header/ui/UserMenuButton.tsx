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
          className='h-8 rounded-lg bg-[#3182F6] px-3 text-sm font-semibold text-white hover:bg-[#1B64DA] flex items-center'
          href={ROUTES_PATH.LOGIN}
        >
          Login
        </Link>
      </div>
    );
  }

  // 로딩 중이거나 인증된 경우 Wallet 버튼과 Avatar 표시
  return (
    <div className='flex items-center justify-end gap-2'>
      <Link
        href={ROUTES_PATH.WALLET}
        className='h-8 rounded-lg px-3 py-0 flex items-center text-muted-foreground transition-colors hover:bg-white/10 hover:text-white'
      >
        <div className='flex items-center gap-2'>
          <Wallet className='size-4' />
          <p className='text-sm font-semibold'>Wallet</p>
        </div>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label='사용자 메뉴'
          className='rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
          disabled={logout.isPending}
        >
          <Avatar className='size-8'>
            <AvatarFallback>
              <UserRound className='size-4' fill='#e0e0e0' />
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
