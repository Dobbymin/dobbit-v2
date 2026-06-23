import { Skeleton, cn } from "@/shared";

type Props = {
  newsDate: string;
  totalNews: number;
  investmentIndex: number;
  isLoading?: boolean;
};

export const NewsListHeader = ({ newsDate, totalNews, investmentIndex, isLoading }: Props) => {
  return (
    <header className='mb-6 flex items-center justify-between'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-bold text-white'>Coin Market Briefing</h2>
        {isLoading ? (
          <Skeleton className='h-5 w-52' />
        ) : (
          <p className='text-sm text-text-muted-dark'>
            {newsDate} 기준 • 총 {totalNews}건의 뉴스 분석
          </p>
        )}
      </div>
      <div className='flex flex-col gap-1 text-right'>
        <p className='text-sm text-text-muted-dark'>투자 심리 지수</p>
        {isLoading ? (
          <Skeleton className='h-9 w-26' />
        ) : (
          <div className='flex items-end justify-end gap-2'>
            <span className={cn("text-3xl font-bold", investmentIndex >= 50 ? "text-positive" : "text-negative")}>
              {Math.round(investmentIndex)}
            </span>
            <span className='pb-1 text-sm text-text-muted-dark'>/ 100</span>
          </div>
        )}
      </div>
    </header>
  );
};
