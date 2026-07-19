import { apiClient } from "@/shared";

export const getFavoritesApi = (): Promise<string[]> => apiClient<string[]>("/favorites");

export const addFavoriteApi = (marketCode: string): Promise<void> =>
  apiClient<void>("/favorites", {
    method: "POST",
    body: JSON.stringify({ marketCode }),
  });

export const removeFavoriteApi = (marketCode: string): Promise<void> =>
  apiClient<void>(`/favorites/${encodeURIComponent(marketCode)}`, {
    method: "DELETE",
  });
