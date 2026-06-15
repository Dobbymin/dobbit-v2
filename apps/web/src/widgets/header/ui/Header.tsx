import { ROUTES_PATH } from "@/shared/constants";

import { LogoButton } from "./LogoButton";
import { NavButton } from "./NavButton";
import { UserMenuButton } from "./UserMenuButton";

export const Header = () => {
  return (
    <header className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur'>
      <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3'>
        <LogoButton />
        <nav className='flex min-w-0 flex-wrap items-center gap-1'>
          <NavButton href={ROUTES_PATH.MARKET}>시장</NavButton>
          <NavButton href={ROUTES_PATH.WALLET}>지갑</NavButton>
          <NavButton href={ROUTES_PATH.NEWS}>뉴스</NavButton>
          <NavButton href={ROUTES_PATH.SETTING}>설정</NavButton>
        </nav>
        <UserMenuButton />
      </div>
    </header>
  );
};
