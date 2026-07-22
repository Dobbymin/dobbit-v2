"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { type RoutePath, cn } from "@/shared";

type NavButtonProps = {
  href: RoutePath;
  disabled?: boolean;
  children: ReactNode;
};

export const NavButton = ({ href, disabled = false, children }: NavButtonProps) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  if (disabled) {
    return (
      <span aria-disabled='true' className='shrink-0 cursor-not-allowed text-sm font-semibold text-muted-foreground/45 rounded-lg px-3 py-2'>
        {children}
      </span>
    );
  }

  return (
    <Link
      className={cn(
        "shrink-0 text-sm leading-normal font-semibold text-muted-foreground transition-colors hover:text-white hover:bg-white/5 rounded-lg px-3 py-2",
        active && "text-foreground",
      )}
      href={href}
    >
      {children}
    </Link>
  );
};
