export const walletKeys = {
  all: ["wallet"] as const,
  summary: () => ["wallet", "summary"] as const,
  assets: () => ["wallet", "assets"] as const,
};
