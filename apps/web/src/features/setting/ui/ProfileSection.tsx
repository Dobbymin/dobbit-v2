"use client";

import { Avatar, AvatarFallback, AvatarImage, Button } from "@/shared";
import { Camera, UserRound } from "lucide-react";

export const ProfileSection = () => {
  return (
    <section className='flex flex-col items-center gap-4 bg-surface-dark p-10'>
      <div className='relative'>
        <Avatar className='border-surface-light size-32 border-2'>
          <AvatarImage alt='User Avatar' className='object-cover' />
          <AvatarFallback className='bg-surface-light'>
            <UserRound className='text-text-muted size-16' />
          </AvatarFallback>
        </Avatar>
        <Button
          size='icon'
          variant='secondary'
          className='hover:bg-surface-light absolute right-0 bottom-0 size-10 rounded-full shadow-lg'
        >
          <Camera className='size-5' />
        </Button>
      </div>
      <p className='text-text-muted text-sm'>프로필 사진 변경</p>
    </section>
  );
};
