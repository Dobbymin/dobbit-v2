"use client";

import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ROUTES_PATH,
} from "@/shared";
import { ChevronRight, UserRound, Wallet } from "lucide-react";

import { useUserMenuActions } from "../model";

export const UserMenuButton = () => {
  const userMenu = useUserMenuActions();

  // 로그인하지 않은 경우 로그인 버튼 표시
  if (!userMenu.isLoading && !userMenu.isAuthenticated) {
    return (
      <div className='flex items-center justify-end'>
        <Button asChild variant='secondary'>
          <Link href={ROUTES_PATH.LOGIN}>로그인</Link>
        </Button>
      </div>
    );
  }

  return <AuthenticatedUserMenuButton {...userMenu} />;
};

type AuthenticatedUserMenuButtonProps = Pick<
  ReturnType<typeof useUserMenuActions>,
  "displayName" | "isLogoutPending" | "logout" | "navigateToSettings"
>;

const AuthenticatedUserMenuButton = ({
  displayName,
  logout,
  navigateToSettings,
  isLogoutPending,
}: AuthenticatedUserMenuButtonProps) => {
  // 로딩 중이거나 인증된 경우 지갑 버튼과 Avatar 표시
  return (
    <div className='flex items-center justify-end gap-2'>
      <Link
        href={ROUTES_PATH.WALLET}
        className='flex h-8 items-center rounded-lg px-3 py-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      >
        <div className='flex items-center gap-2'>
          <Wallet className='size-4' />
          <p className='text-sm font-semibold'>지갑</p>
        </div>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label='사용자 메뉴'
          className='rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
          disabled={isLogoutPending}
        >
          <Avatar className='size-8'>
            <AvatarFallback>
              <UserRound className='size-4' fill='#e0e0e0' />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuLabel>
            <div className='flex items-center gap-3'>
              <Avatar className='size-8'>
                <AvatarFallback>
                  <UserRound className='size-4' fill='#e0e0e0' />
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold'>{displayName}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={navigateToSettings} className='flex items-center justify-between'>
            내 정보
            <ChevronRight size={16} className='text-muted-foreground' />
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={logout}>로그아웃</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
