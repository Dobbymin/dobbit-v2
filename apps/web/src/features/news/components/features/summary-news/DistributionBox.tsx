import { Skeleton, cn } from "@/shared";

import { getWidthStyle } from "../../../utils";

type Props = {
  positive: number;
  neutral: number;
  negative: number;
  totalNews: number;
  isLoading?: boolean;
};

export const DistributionBox = ({ positive, neutral, negative, totalNews, isLoading }: Props) => {
  if (isLoading) {
    return (
      <>
        <Skeleton className='mb-6 h-4 w-full rounded-full' />
        <div className='flex justify-between text-xs'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-16' />
        </div>
      </>
    );
  }

  const segments = [
    {
      key: "positive",
      value: positive,
      color: "bg-positive",
    },
    {
      key: "neutral",
      value: neutral,
      color: "bg-text-dark/50",
    },
    {
      key: "negative",
      value: negative,
      color: "bg-negative",
    },
  ];

  return (
    <>
      <div className='mb-6 flex h-4 w-full overflow-hidden rounded-full bg-black/30'>
        {segments.map((segment) => (
          <div
            key={segment.key}
            style={getWidthStyle(segment.value, totalNews)}
            className={cn("h-full transition-all duration-500 ease-in-out", segment.color)}
          />
        ))}
      </div>
      <div className='flex justify-between text-xs'>
        <span className='text-positive'>긍정 {positive}건</span>
        <span className='text-text-dark/50'>중립 {neutral}건</span>
        <span className='text-negative'>부정 {negative}건</span>
      </div>
    </>
  );
};
