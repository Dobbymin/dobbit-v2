import { ROUTES_PATH } from "@/shared";

import { LogoButton } from "./LogoButton";
import { NavButton } from "./NavButton";
import { UserMenuButton } from "./UserMenuButton";

export const Header = () => {
  return (
    <header className='sticky top-0 z-40 h-20 border-b border-white/10 bg-[#121212]'>
      <div className='mx-auto grid h-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6'>
        <LogoButton />
        <nav className='hidden min-w-0 items-center justify-center gap-9 md:flex'>
          <NavButton href={ROUTES_PATH.HOME}>Dashboard</NavButton>
          <NavButton disabled href={ROUTES_PATH.HOME}>
            Auto Trade
          </NavButton>
          <NavButton href={ROUTES_PATH.NEWS}>News</NavButton>
          <NavButton href={ROUTES_PATH.SETTING}>Setting</NavButton>
        </nav>
        <UserMenuButton />
      </div>
    </header>
  );
};
