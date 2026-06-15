import type { NewsSentiment } from "@/entities/news";
import { Badge } from "@/shared/components/ui";

import type { NewsListItem } from "../api";

const sentimentLabel: Record<NewsSentiment, string> = {
  positive: "긍정",
  neutral: "중립",
  negative: "부정",
};

const normalizeSentiment = (sentiment?: string): NewsSentiment => {
  const value = sentiment?.toLowerCase();
  if (value === "positive" || value === "negative" || value === "neutral") {
    return value;
  }
  return "neutral";
};

type NewsCardProps = {
  item: NewsListItem;
};

export const NewsCard = ({ item }: NewsCardProps) => {
  const sentiment = normalizeSentiment(item.sentiment);

  return (
    <article className='rounded-lg border bg-card p-5'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='text-base font-semibold leading-6'>
            <a className='hover:underline' href={item.url} rel='noreferrer' target='_blank'>
              {item.title}
            </a>
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            {item.source} · {new Date(item.publishedAt).toLocaleString("ko-KR")}
          </p>
        </div>
        <Badge variant={sentiment === "negative" ? "destructive" : sentiment === "positive" ? "default" : "secondary"}>
          {sentimentLabel[sentiment]}
        </Badge>
      </div>
      {item.summary ? <p className='mt-3 text-sm leading-6 text-muted-foreground'>{item.summary}</p> : null}
    </article>
  );
};
