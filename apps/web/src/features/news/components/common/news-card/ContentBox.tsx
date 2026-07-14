import { Skeleton } from "@/shared";

import { cleanContent } from "../../../utils";

type Props = {
  content?: string | null;
  isLoading?: boolean;
};

export const ContentBox = ({ content, isLoading }: Props) => {
  if (!content && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-11/12' />
        <Skeleton className='h-4 w-4/5' />
      </div>
    );
  }

  return (
    <p className='line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground transition-all group-hover:line-clamp-none'>
      {content ? cleanContent(content) : ""}
    </p>
  );
};
