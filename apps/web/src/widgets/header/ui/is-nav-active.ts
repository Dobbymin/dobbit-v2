import { ROUTES_PATH } from "@/shared";

export const isNavActive = (pathname: string, href: string): boolean => {
  if (href.startsWith(`${ROUTES_PATH.TRADE}/`)) {
    return pathname === ROUTES_PATH.TRADE || pathname.startsWith(`${ROUTES_PATH.TRADE}/`);
  }

  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
};
