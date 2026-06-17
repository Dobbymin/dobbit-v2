import { Badge, Skeleton } from '@/shared';

type Props = {
  keywords: string[];
  isLoading?: boolean;
};

export const KeywordBox = ({ keywords, isLoading }: Props) => {
  return (
    <div className='flex flex-col gap-4'>
      <p className='text-sm'>Today&apos;s Keywords</p>
      <div className='flex flex-wrap gap-2'>
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className='h-5 w-16 rounded-full' />)
          : keywords.map((k, index) => (
              <Badge
                key={`${k}-${index}`}
                variant='secondary'
                className='bg-white/5 text-gray-300 transition-colors hover:bg-white/10'
              >
                # {k}
              </Badge>
            ))}
      </div>
    </div>
  );
};
