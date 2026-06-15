import { cn } from "@/shared/libs/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot='skeleton' className={cn("bg-text-dark/20 animate-pulse rounded-sm", className)} {...props} />;
}

export { Skeleton };
