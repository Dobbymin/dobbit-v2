export const ROUTES = {
  home: "/",
  login: "/login",
  market: "/market",
  wallet: "/wallet",
  news: "/news",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
