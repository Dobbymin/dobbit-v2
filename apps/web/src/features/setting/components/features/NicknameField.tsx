"use client";

import { Button, Input, Label, Skeleton } from "@/shared";

import { useNicknameField } from "../../model";

export const NicknameField = () => {
  const {
    userNickname,
    inputValue,
    isEditing,
    isNicknameValid,
    isProfileLoading,
    isUpdatePending,
    updateError,
    changeNickname,
    editNickname,
  } = useNicknameField();

  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-2'>
        <Label className='w-16 text-base text-foreground'>닉네임</Label>
        <div className='flex items-center gap-4'>
          {isEditing ? (
            <Input
              className='min-w-70'
              value={inputValue}
              onChange={(event) => changeNickname(event.target.value)}
              disabled={isUpdatePending}
              placeholder='닉네임을 입력하세요'
            />
          ) : (
            <div className='flex h-10 min-w-70 items-center rounded-md bg-background px-3 py-2'>
              {isProfileLoading ? (
                <Skeleton className='h-5 w-32' />
              ) : (
                <p className='text-sm text-muted-foreground'>{userNickname}</p>
              )}
            </div>
          )}
          <Button
            onClick={editNickname}
            variant='outline'
            className='h-10'
            disabled={isProfileLoading || isUpdatePending || (isEditing && !isNicknameValid)}
          >
            {isUpdatePending ? "저장 중" : isEditing ? "저장" : "수정"}
          </Button>
        </div>
      </div>
      {updateError ? <p className='pl-[72px] text-sm text-destructive'>{updateError.message}</p> : null}
    </div>
  );
};
