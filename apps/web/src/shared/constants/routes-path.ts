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

export const TRADE_DEFAULT_MARKET_CODE = "KRW-BTC";
export const TRADE_DEFAULT_PATH = `${ROUTES_PATH.TRADE}/${TRADE_DEFAULT_MARKET_CODE}` as const;

export type RouteKey = keyof typeof ROUTES_PATH;
export type RoutePath = (typeof ROUTES_PATH)[RouteKey] | `${typeof ROUTES_PATH.TRADE}/${string}`;
