export const isNavActive = (pathname: string, href: string): boolean =>
  pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
