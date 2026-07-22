import { ROUTES_PATH } from "@/shared";

import { LogoButton } from "./LogoButton";
import { NavButton } from "./NavButton";
import { UserMenuButton } from "./UserMenuButton";

export const Header = () => {
  return (
    <header className='sticky top-0 z-50 h-14 w-full bg-background/80 backdrop-blur'>
      <div className='flex h-full w-full items-center justify-between px-4'>
        <div className='flex items-center gap-4'>
          <LogoButton />
          <nav className='hidden items-center gap-1 md:flex'>
            <NavButton href={ROUTES_PATH.HOME}>홈</NavButton>
            <NavButton href={ROUTES_PATH.AUTO_TRADE}>자동매매</NavButton>
            <NavButton href={ROUTES_PATH.NEWS}>뉴스</NavButton>
            <NavButton href={ROUTES_PATH.SETTING}>설정</NavButton>
          </nav>
        </div>
        <UserMenuButton />
      </div>
    </header>
  );
};
