import Link from "next/link";

import { Button } from "@/shared";

type PageFallbackAction = { label: string; href: string } | { label: string; onClick: () => void };

type PageFallbackProps = {
  title: string;
  description?: string;
  action?: PageFallbackAction;
};

export const PageFallback = ({ title, description, action }: PageFallbackProps) => {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center'>
      <h1 className='text-xl font-bold text-foreground'>{title}</h1>
      {description ? <p className='text-sm text-muted-foreground'>{description}</p> : null}
      {action ? (
        <div className='mt-2'>
          {"href" in action ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
};
