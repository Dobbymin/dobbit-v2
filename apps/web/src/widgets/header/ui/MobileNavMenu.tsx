"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared";
import { Menu } from "lucide-react";

import { NAV_ITEMS } from "./nav-items";
import { isNavActive } from "./is-nav-active";

export const MobileNavMenu = () => {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='메뉴 열기'
        className='rounded-lg p-2 text-muted-foreground transition-colors outline-none hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-ring md:hidden'
      >
        <Menu className='size-5' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {NAV_ITEMS.map((item) => (
          <DropdownMenuItem asChild key={item.href}>
            <Link className={cn("text-muted-foreground", isNavActive(pathname, item.href) && "text-foreground")} href={item.href}>
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
