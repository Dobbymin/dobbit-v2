"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type UpdateNicknameRequest, updateNicknameApi } from "../api";

import { settingKeys } from "./setting-query-keys";

export const useUpdateNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateNicknameRequest) => updateNicknameApi(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.profile() });
    },
  });
};
