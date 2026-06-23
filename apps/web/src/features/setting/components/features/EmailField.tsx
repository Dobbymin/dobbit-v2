"use client";

import { Label, Skeleton } from "@/shared";

import { useProfile } from "../../model";

export const EmailField = () => {
  const profile = useProfile();

  return (
    <div className='flex items-center gap-2'>
      <Label className='text-md text-text-primary w-16'>이메일</Label>
      <div className='flex h-10 min-w-70 items-center rounded-md bg-background px-3 py-2'>
        {profile.isLoading ? (
          <Skeleton className='h-5 w-32' />
        ) : (
          <p className='text-text-muted text-sm'>{profile.data?.email}</p>
        )}
      </div>
    </div>
  );
};
