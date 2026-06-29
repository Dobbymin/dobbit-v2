import { Skeleton } from "@/shared";

type Props = {
  keywords: string[];
  isLoading?: boolean;
};

export const KeywordBox = ({ keywords, isLoading }: Props) => {
  return (
    <div className='flex flex-col gap-4'>
      <p className='text-sm text-text-dark'>Today&apos;s Keywords</p>
      <div className='flex flex-wrap gap-2'>
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className='h-5 w-16' />)
          : keywords.map((k) => (
              <span
                key={k}
                className='inline-flex w-fit items-center bg-white/5 px-2 py-0.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10'
              >
                # {k}
              </span>
            ))}
      </div>
    </div>
  );
};
