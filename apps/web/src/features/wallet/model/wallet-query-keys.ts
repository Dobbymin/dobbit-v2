export const walletKeys = {
  all: ["wallet"] as const,
  summary: () => ["wallet", "summary"] as const,
  assets: () => ["wallet", "assets"] as const,
  cashHistory: (limit: number, offset: number) => ["wallet", "cash-history", limit, offset] as const,
};
