import type { PropsWithChildren } from "react";

import { AppLayout } from "@/widgets";

export default function ShellLayout({ children }: PropsWithChildren) {
  return <AppLayout>{children}</AppLayout>;
}
