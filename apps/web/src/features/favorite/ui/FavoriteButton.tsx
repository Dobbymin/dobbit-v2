"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { Button, Popover, PopoverContent, PopoverTrigger, ROUTES_PATH } from "@/shared";
import { useIsAuth } from "@/shared/store";

import { useFavorites, useToggleFavorite } from "../model";

type FavoriteButtonProps = {
  marketCode: string;
};

const LoginPopoverButton = () => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        aria-label='관심 등록'
        className='inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
        type='button'
        onClick={(event) => event.stopPropagation()}
      >
        <Heart size={24} />
      </button>
    </PopoverTrigger>
    <PopoverContent className='w-56 space-y-3'>
      <p className='text-sm text-foreground'>관심 등록이 필요해요</p>
      <div className='flex items-center gap-3'>
        <Button asChild size='sm'>
          <Link href={ROUTES_PATH.LOGIN}>로그인</Link>
        </Button>
        <Link className='text-sm text-muted-foreground hover:text-foreground' href={ROUTES_PATH.SIGNUP}>
          회원가입
        </Link>
      </div>
    </PopoverContent>
  </Popover>
);

const AuthenticatedFavoriteButton = ({ marketCode }: FavoriteButtonProps) => {
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const isFavorited = favorites?.has(marketCode) ?? false;

  return (
    <button
      aria-label={isFavorited ? "관심 해제" : "관심 등록"}
      className='inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      type='button'
      onClick={(event) => {
        event.stopPropagation();
        toggleFavorite.mutate({ marketCode, isFavorited });
      }}
    >
      <Heart className={isFavorited ? "fill-current" : undefined} size={24} />
    </button>
  );
};

export const FavoriteButton = ({ marketCode }: FavoriteButtonProps) => {
  const { isAuthenticated } = useIsAuth();

  if (!isAuthenticated) {
    return <LoginPopoverButton />;
  }

  return <AuthenticatedFavoriteButton marketCode={marketCode} />;
};
