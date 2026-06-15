export const settingKeys = {
  all: ["setting"] as const,
  profile: () => ["setting", "profile"] as const,
};
