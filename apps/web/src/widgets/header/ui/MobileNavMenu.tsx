"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, cn } from "@/shared";
import { Menu } from "lucide-react";

import { isNavActive } from "./is-nav-active";
import { NAV_ITEMS } from "./nav-items";

export const MobileNavMenu = () => {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='메뉴 열기'
        className='rounded-lg p-2 text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:hidden'
      >
        <Menu className='size-5' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {NAV_ITEMS.map((item) => (
          <DropdownMenuItem asChild key={item.href}>
            <Link
              className={cn("text-muted-foreground", isNavActive(pathname, item.href) && "text-foreground")}
              href={item.href}
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
