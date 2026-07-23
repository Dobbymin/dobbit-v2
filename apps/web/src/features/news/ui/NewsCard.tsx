"use client";

import type { NewsListItem } from "../api";
import { ContentBox, MetaDataBox, ReasonBox, TitleBox } from "../components/common/news-card";
import { getSentimentConfig } from "../utils";

type NewsCardProps = {
  item: NewsListItem;
  isLoading?: boolean;
};

export const NewsCard = ({ item, isLoading }: NewsCardProps) => {
  const sentiment = item.sentiment?.toUpperCase();
  const config = getSentimentConfig(sentiment);

  return (
    <article className='group flex flex-col gap-4 overflow-hidden bg-card p-6 transition-all hover:border-input'>
      <TitleBox title={item.title} url={item.url} confidence={item.confidence} config={config} isLoading={isLoading} />

      {!isLoading && (
        <>
          <ReasonBox reason={item.reason} config={config} isLoading={isLoading} />
          <ContentBox content={item.content} isLoading={isLoading} />
          <div className='-mx-6 -mb-6 border-t border-border bg-surface-sunken px-6 py-3'>
            <MetaDataBox keywords={item.keywords} source={item.source} isLoading={isLoading} />
          </div>
        </>
      )}
    </article>
  );
};
