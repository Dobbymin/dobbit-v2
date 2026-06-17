"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAlertRule } from "../api";

import { alertQueryKeys } from "./useAlertRules";

export const useDeleteAlertRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => deleteAlertRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertQueryKeys.all });
    },
  });
};
