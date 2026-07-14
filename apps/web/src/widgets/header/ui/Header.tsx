import { ROUTES_PATH } from "@/shared";

import { LogoButton } from "./LogoButton";
import { NavButton } from "./NavButton";
import { UserMenuButton } from "./UserMenuButton";

export const Header = () => {
  return (
    <header className='h-20 w-full border-b border-solid border-white/10 bg-card/30'>
      <div className='mx-auto flex h-full w-full items-center justify-between px-6 py-3'>
        <LogoButton />
        <nav className='hidden flex-1 items-center justify-center gap-9 md:flex'>
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
