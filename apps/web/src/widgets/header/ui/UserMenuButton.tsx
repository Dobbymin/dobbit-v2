"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  ROUTES_PATH,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/shared";
import { useIsAuth } from "@/shared/store";
import { UserRound, Wallet } from "lucide-react";

import { useLogout } from "@/features/auth";

export const UserMenuButton = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useIsAuth();
  const logout = useLogout();

  const handleSelectChange = (value: string) => {
    if (value === "logout") {
      logout.mutate();
    } else if (value === "setting") {
      router.push(ROUTES_PATH.SETTING);
    }
  };

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
      <Select onValueChange={handleSelectChange} disabled={logout.isPending}>
        <SelectTrigger className='border-0 bg-transparent p-0 shadow-none ring-0 outline-none hover:bg-transparent focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 [&>svg]:hidden'>
          <Avatar>
            <AvatarFallback>
              <UserRound className='size-5' fill='#e0e0e0' />
            </AvatarFallback>
          </Avatar>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value='setting'>Setting</SelectItem>
            <SelectItem value='logout'>Logout</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
