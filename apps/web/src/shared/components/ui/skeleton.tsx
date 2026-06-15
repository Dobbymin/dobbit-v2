import { cn } from "@/shared/libs/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot='skeleton' className={cn("animate-pulse rounded-sm bg-text-dark/20", className)} {...props} />;
}

export { Skeleton };
