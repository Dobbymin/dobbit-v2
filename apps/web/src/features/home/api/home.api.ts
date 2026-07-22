import { apiClient } from "@/shared";
import type { HomeSummaryResponse } from "@dobbit/shared";

export const getHomeSummaryApi = (): Promise<HomeSummaryResponse> => apiClient<HomeSummaryResponse>("/home/summary");
