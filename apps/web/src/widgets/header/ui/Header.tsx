import { ROUTES_PATH } from "@/shared";

import { LogoButton } from "./LogoButton";
import { NavButton } from "./NavButton";
import { UserMenuButton } from "./UserMenuButton";

export const Header = () => {
  return (
    <header className='h-14 sticky top-0 z-50 bg-background/80 backdrop-blur w-full'>
      <div className='mx-auto flex h-full w-full items-center justify-between px-6 lg:px-10'>
        <LogoButton />
        <nav className='hidden flex-1 items-center justify-center gap-1 md:flex'>
          <NavButton href={ROUTES_PATH.HOME}>Dashboard</NavButton>
          <NavButton href={ROUTES_PATH.AUTO_TRADE}>Auto Trade</NavButton>
          <NavButton href={ROUTES_PATH.NEWS}>News</NavButton>
          <NavButton href={ROUTES_PATH.SETTING}>Setting</NavButton>
        </nav>
        <UserMenuButton />
      </div>
    </header>
  );
};
