import { LogoButton } from "./LogoButton";
import { MobileNavMenu } from "./MobileNavMenu";
import { NavButton } from "./NavButton";
import { UserMenuButton } from "./UserMenuButton";
import { NAV_ITEMS } from "./nav-items";

export const Header = () => {
  return (
    <header className='fixed top-0 z-50 h-[52px] w-full bg-background/80 backdrop-blur'>
      <div className='flex h-full w-full items-center justify-between px-4'>
        <div className='flex items-center gap-4'>
          <MobileNavMenu />
          <LogoButton />
          <nav className='hidden items-center gap-1 md:flex'>
            {NAV_ITEMS.map((item) => (
              <NavButton key={item.href} href={item.href}>
                {item.label}
              </NavButton>
            ))}
          </nav>
        </div>
        <UserMenuButton />
      </div>
    </header>
  );
};
