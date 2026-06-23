import { Skeleton } from "@/shared";

type Props = {
  keywords?: string[] | null;
  source: string;
  isLoading?: boolean;
};

export const MetaDataBox = ({ keywords, source, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className='flex items-center justify-between'>
        <div className='flex gap-2'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-14' />
        </div>
        <Skeleton className='h-4 w-20' />
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex gap-2'>
        {keywords && keywords.length > 0
          ? keywords.map((k, index) => (
              <span key={`${k}-${index}`} className='text-xs text-text-muted-dark'>
                # {k}
              </span>
            ))
          : null}
      </div>
      <span className='text-xs font-medium text-text-muted-dark'>{source}</span>
    </div>
  );
};
