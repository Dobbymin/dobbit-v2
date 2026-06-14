export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  list: (unreadOnly?: boolean) => ["notifications", { unreadOnly }] as const,
  slack: () => ["notifications", "slack"] as const,
};
