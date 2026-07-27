import type { HomeNewsItem } from "@dobbit/shared";

export const formatRelativeTime = (publishedAt: string, now = Date.now()) => {
  const minutes = Math.max(0, Math.floor((now - new Date(publishedAt).getTime()) / 60_000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / 1_440)}일 전`;
};

export const getSentimentClassName = (sentiment: HomeNewsItem["sentiment"]) => {
  if (sentiment === "POSITIVE") return "text-increase";
  if (sentiment === "NEGATIVE") return "text-decrease";
  return "text-subtle-foreground";
};

export const getSentimentLabel = (sentiment: HomeNewsItem["sentiment"]) => {
  if (sentiment === "POSITIVE") return "호재";
  if (sentiment === "NEGATIVE") return "악재";
  return "중립";
};

export type HomeNewsDisplayItem = HomeNewsItem & {
  relativeTime: string;
  sentimentClassName: string;
  sentimentLabel: string;
};

export const toHomeNewsDisplayItems = (news: HomeNewsItem[], now?: number): HomeNewsDisplayItem[] =>
  news.map((item) => ({
    ...item,
    relativeTime: formatRelativeTime(item.publishedAt, now),
    sentimentClassName: getSentimentClassName(item.sentiment),
    sentimentLabel: getSentimentLabel(item.sentiment),
  }));
