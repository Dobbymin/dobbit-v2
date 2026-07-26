"use client";

import { cn } from "@/shared";
import { useSidebarStore } from "@/shared/store";

import { LogoButton } from "./LogoButton";
import { MobileNavMenu } from "./MobileNavMenu";
import { NavButton } from "./NavButton";
import { UserMenuButton } from "./UserMenuButton";
import { NAV_ITEMS } from "./nav-items";

export const Header = () => {
  const isSidebarOpen = useSidebarStore((state) => state.isOpen);

  return (
    <header className='fixed top-0 z-50 h-[52px] w-full bg-background/80 backdrop-blur'>
      <div
        className={cn(
          "flex h-full w-full items-center justify-between px-4 transition-[padding] duration-300 ease-out motion-reduce:transition-none",
          isSidebarOpen ? "lg:pr-[400px]" : "lg:pr-16",
        )}
      >
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
