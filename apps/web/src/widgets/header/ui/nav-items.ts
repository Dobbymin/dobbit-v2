import { ROUTES_PATH, type RoutePath } from "@/shared";

export const NAV_ITEMS: { href: RoutePath; label: string }[] = [
  { href: ROUTES_PATH.HOME, label: "홈" },
  { href: ROUTES_PATH.AUTO_TRADE, label: "자동매매" },
  { href: ROUTES_PATH.NEWS, label: "뉴스" },
  { href: ROUTES_PATH.SETTING, label: "설정" },
];
