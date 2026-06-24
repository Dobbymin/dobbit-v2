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
  const active = pathname === href;

  if (disabled) {
    return (
      <span aria-disabled='true' className='shrink-0 cursor-not-allowed text-sm font-semibold text-text-muted-dark/45'>
        {children}
      </span>
    );
  }

  return (
    <Link
      className={cn(
        "shrink-0 text-sm leading-normal font-medium text-text-muted-dark transition-colors hover:text-white",
        active && "text-white",
      )}
      href={href}
    >
      {children}
    </Link>
  );
};
