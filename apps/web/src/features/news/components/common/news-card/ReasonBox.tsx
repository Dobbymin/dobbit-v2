import { Skeleton, cn } from '@/shared';

type Props = {
  reason?: string | null;
  config: {
    border: string;
    bg: string;
  };
  isLoading?: boolean;
};

export const ReasonBox = ({ reason, config, isLoading }: Props) => {
  if (!reason && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-2 border border-white/10 bg-white/5 px-4 py-3'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-5/6' />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2 border px-4 py-3', config.border, config.bg)}>
      <p className='text-xs font-bold tracking-wider text-inherit uppercase opacity-70'>AI Insight</p>
      <p className='text-sm leading-relaxed font-medium text-white/90'>{reason}</p>
    </div>
  );
};
