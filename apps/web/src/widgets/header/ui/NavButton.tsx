"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { type RoutePath, cn } from "@/shared";

import { isNavActive } from "./is-nav-active";

type NavButtonProps = {
  href: RoutePath;
  disabled?: boolean;
  children: ReactNode;
};

export const NavButton = ({ href, disabled = false, children }: NavButtonProps) => {
  const pathname = usePathname();
  const active = isNavActive(pathname, href);

  if (disabled) {
    return (
      <span
        aria-disabled='true'
        className='shrink-0 cursor-not-allowed rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground/45'
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      className={cn(
        "shrink-0 rounded-lg px-3 py-2 text-sm leading-normal font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        active && "text-foreground",
      )}
      href={href}
    >
      {children}
    </Link>
  );
};
