'use client';

import { TitleBox, ReasonBox, ContentBox, MetaDataBox } from '../components/common/news-card';
import { getSentimentConfig } from '../utils';

import type { NewsListItem } from '../api';

type NewsCardProps = {
  item: NewsListItem;
  isLoading?: boolean;
};

export const NewsCard = ({ item, isLoading }: NewsCardProps) => {
  const sentiment = item.sentiment?.toUpperCase();
  const config = getSentimentConfig(sentiment);

  return (
    <article className='group flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10'>
      <TitleBox
        title={item.title}
        url={item.url}
        confidence={item.confidence}
        config={config}
        isLoading={isLoading}
      />

      {!isLoading && (
        <>
          <ReasonBox reason={item.reason} config={config} isLoading={isLoading} />
          <ContentBox content={item.content} isLoading={isLoading} />
          <MetaDataBox keywords={item.keywords} source={item.source} isLoading={isLoading} />
        </>
      )}
    </article>
  );
};
