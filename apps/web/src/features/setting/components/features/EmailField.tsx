"use client";

import { Label, Skeleton } from "@/shared";

import { useProfile } from "../../model";

export const EmailField = () => {
  const profile = useProfile();

  return (
    <div className='flex items-center gap-2'>
      <Label className='w-16 text-base text-foreground'>아이디</Label>
      <div className='flex h-10 min-w-70 items-center rounded-md bg-background px-3 py-2'>
        {profile.isLoading ? (
          <Skeleton className='h-5 w-32' />
        ) : (
          <p className='text-sm text-muted-foreground'>{profile.data?.username}</p>
        )}
      </div>
    </div>
  );
};
