"use client";

import { Label, Skeleton } from "@/shared";

import { useProfile } from "../../model";
import { formattedDate } from "../../utils";

export const LastLoginField = () => {
  const profile = useProfile();

  const formattedCreatedAt = formattedDate(profile.data?.createdAt ?? "");

  return (
    <div className='flex items-center gap-2'>
      <Label className='w-16 text-base text-foreground'>가입일</Label>
      <div className='flex h-10 min-w-70 items-center rounded-md bg-background px-3 py-2'>
        {profile.isLoading ? (
          <Skeleton className='h-5 w-32' />
        ) : (
          <p className='text-sm text-muted-foreground' suppressHydrationWarning>
            {formattedCreatedAt}
          </p>
        )}
      </div>
    </div>
  );
};
