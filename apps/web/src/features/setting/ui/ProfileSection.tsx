"use client";

import { Avatar, AvatarFallback, AvatarImage, Button } from "@/shared";
import { Camera, UserRound } from "lucide-react";

export const ProfileSection = () => {
  return (
    <section className='flex flex-col items-center gap-4 bg-card p-10'>
      <div className='relative'>
        <Avatar className='size-32 border-2 border-border'>
          <AvatarImage alt='User Avatar' className='object-cover' />
          <AvatarFallback className='bg-card'>
            <UserRound className='size-16 text-muted-foreground' />
          </AvatarFallback>
        </Avatar>
        <Button
          size='icon'
          variant='secondary'
          aria-label='프로필 사진 변경'
          className='absolute right-0 bottom-0 size-10 rounded-full shadow-lg'
        >
          <Camera className='size-5' />
        </Button>
      </div>
      <p className='text-sm text-muted-foreground'>프로필 사진 변경</p>
    </section>
  );
};
