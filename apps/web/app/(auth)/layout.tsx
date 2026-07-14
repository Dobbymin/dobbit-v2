import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='bg-card p-8'>{children}</div>
    </div>
  );
}
