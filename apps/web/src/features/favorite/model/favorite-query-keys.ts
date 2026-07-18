export const favoriteKeys = {
  all: ["favorite"] as const,
  list: () => ["favorite", "list"] as const,
};
