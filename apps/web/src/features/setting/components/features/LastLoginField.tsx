"use client";

import { Label, Skeleton } from "@/shared";

import { useProfile } from "../../model";
import { formattedDate } from "../../utils";

export const LastLoginField = () => {
  const profile = useProfile();

  const formattedCreatedAt = formattedDate(profile.data?.createdAt ?? "");

  return (
    <div className='flex items-center gap-2'>
      <Label className='text-text-primary w-16 text-base'>가입일</Label>
      <div className='flex h-10 min-w-70 items-center rounded-md bg-background px-3 py-2'>
        {profile.isLoading ? (
          <Skeleton className='h-5 w-32' />
        ) : (
          <p className='text-text-muted text-sm'>{formattedCreatedAt}</p>
        )}
      </div>
    </div>
  );
};
