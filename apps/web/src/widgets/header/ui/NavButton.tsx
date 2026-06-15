"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/libs/utils";
import type { RoutePath } from "@/shared/constants";

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
