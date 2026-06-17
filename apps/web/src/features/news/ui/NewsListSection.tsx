'use client';

import { useState } from 'react';
import { Button } from '@/shared';
import type { NewsListQuery } from '../api';
import { useNews } from '../model';
import { NewsCard } from './NewsCard';

type NewsListSectionProps = {
  query?: NewsListQuery;
};

const ITEMS_PER_PAGE = 5;

export const NewsListSection = ({ query }: NewsListSectionProps) => {
  const [page, setPage] = useState(0);
  const currentQuery = { ...query, limit: ITEMS_PER_PAGE, offset: page * ITEMS_PER_PAGE };
  const news = useNews(currentQuery);

  const handlePrevious = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (news.data && news.data.length === ITEMS_PER_PAGE) {
      setPage(page + 1);
    }
  };

  return (
    <section className='space-y-4'>
      <div>
        <h2 className='text-lg font-semibold'>뉴스 분석</h2>
      </div>

      {news.isLoading ? (
        <p className='text-sm text-gray-500'>뉴스를 불러오는 중입니다.</p>
      ) : null}

      {!news.isLoading && !news.data?.length ? (
        <p className='text-sm text-gray-500'>표시할 뉴스가 없습니다.</p>
      ) : null}

      <div className='space-y-3'>
        {news.data?.map((item) => (
          <NewsCard item={item} key={item.id} isLoading={news.isLoading} />
        ))}
      </div>

      {!news.isLoading && news.data && news.data.length > 0 && (
        <div className='flex items-center justify-between pt-4'>
          <Button
            variant='outline'
            onClick={handlePrevious}
            disabled={page === 0}
            className='text-gray-400 hover:text-white'
          >
            이전
          </Button>

          <span className='text-sm text-gray-500'>
            페이지 {page + 1}
          </span>

          <Button
            variant='outline'
            onClick={handleNext}
            disabled={news.data.length < ITEMS_PER_PAGE}
            className='text-gray-400 hover:text-white'
          >
            다음
          </Button>
        </div>
      )}
    </section>
  );
};
