"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui";
import type { RoutePath } from "@/shared/constants";
import { cn } from "@/shared/libs/utils";

type NavButtonProps = {
  href: RoutePath;
  children: ReactNode;
};

export const NavButton = ({ href, children }: NavButtonProps) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Button asChild className={cn("shrink-0", active && "bg-accent text-accent-foreground")} size='sm' variant='ghost'>
      <Link href={href}>{children}</Link>
    </Button>
  );
};
