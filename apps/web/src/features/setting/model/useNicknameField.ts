"use client";

import { useEffect, useState } from "react";

import { isValidNickname, normalizeNickname } from "../utils";

import { useProfile } from "./useProfile";
import { useUpdateNickname } from "./useUpdateNickname";

export const useNicknameField = () => {
  const profile = useProfile();
  const updateNickname = useUpdateNickname();
  const userNickname = profile.data?.nickname ?? "";
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(userNickname);
  const trimmedNickname = normalizeNickname(inputValue);
  const isNicknameValid = isValidNickname(trimmedNickname);

  useEffect(() => {
    setInputValue(userNickname);
  }, [userNickname]);

  const changeNickname = (value: string) => setInputValue(value);

  const editNickname = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!isNicknameValid) return;

    updateNickname.mutate(
      { nickname: trimmedNickname },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  return {
    userNickname,
    inputValue,
    isEditing,
    isNicknameValid,
    isProfileLoading: profile.isLoading,
    isUpdatePending: updateNickname.isPending,
    updateError: updateNickname.error,
    changeNickname,
    editNickname,
  };
};
