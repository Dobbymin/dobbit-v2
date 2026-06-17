"use client";

import type { CreateAlertRuleRequest } from "@dobbit/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAlertRule } from "../api";

import { alertQueryKeys } from "./useAlertRules";

export const useCreateAlertRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAlertRuleRequest) => createAlertRule(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertQueryKeys.all });
    },
  });
};
