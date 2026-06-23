export const ROUTES_PATH = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  MARKET: "/market",
  WALLET: "/wallet",
  AUTO_TRADE: "/auto-trade",
  TRADE: "/trade",
  NEWS: "/news",
  SETTING: "/setting",
} as const;

export type RouteKey = keyof typeof ROUTES_PATH;
export type RoutePath = (typeof ROUTES_PATH)[RouteKey];
