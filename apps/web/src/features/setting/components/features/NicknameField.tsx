"use client";

import { useEffect, useState } from "react";

import { Button, Input, Label, Skeleton } from "@/shared";

import { useProfile, useUpdateNickname } from "../../model";

export const NicknameField = () => {
  const profile = useProfile();
  const updateNickname = useUpdateNickname();

  const userNickname = profile.data?.nickname ?? "";

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(userNickname);

  useEffect(() => {
    setInputValue(userNickname);
  }, [userNickname]);

  const trimmedNickname = inputValue.trim();
  const isValidNickname = trimmedNickname.length >= 2 && trimmedNickname.length <= 24;

  const onClickEditButton = () => {
    if (isEditing) {
      if (!isValidNickname) return;
      updateNickname.mutate({ nickname: trimmedNickname }, { onSuccess: () => setIsEditing(false) });
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-2'>
        <Label className='w-16 text-base text-foreground'>닉네임</Label>
        <div className='flex items-center gap-4'>
          {isEditing ? (
            <Input
              className='min-w-70'
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={updateNickname.isPending}
              placeholder='닉네임을 입력하세요'
            />
          ) : (
            <div className='flex h-10 min-w-70 items-center rounded-md bg-background px-3 py-2'>
              {profile.isLoading ? (
                <Skeleton className='h-5 w-32' />
              ) : (
                <p className='text-sm text-muted-foreground'>{userNickname}</p>
              )}
            </div>
          )}
          <Button
            onClick={onClickEditButton}
            variant='outline'
            className='h-10'
            disabled={profile.isLoading || updateNickname.isPending || (isEditing && !isValidNickname)}
          >
            {updateNickname.isPending ? "저장 중" : isEditing ? "저장" : "수정"}
          </Button>
        </div>
      </div>
      {updateNickname.isError ? (
        <p className='pl-[72px] text-sm text-destructive'>{updateNickname.error.message}</p>
      ) : null}
    </div>
  );
};
