export type HomeRankingItem = {
  rank: number;
  marketCode: string;
  koreanName: string;
  tradePrice: number;
  signedChangeRate: number;
  accTradePrice24h: number;
  accTradeVolume24h: number;
};

export type HomeHighlight = {
  marketCode: string;
  koreanName: string;
  tradePrice: number;
  signedChangeRate: number;
  sparkline: number[];
};

export type HomeNewsItem = {
  id: string;
  title: string;
  url: string;
  publisher: string | null;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null;
};

export type HomeSummaryResponse = {
  highlights: HomeHighlight[];
  rankings: {
    tradePrice: HomeRankingItem[];
    surge: HomeRankingItem[];
    plunge: HomeRankingItem[];
    volume: HomeRankingItem[];
    popular: HomeRankingItem[];
  };
  news: HomeNewsItem[];
};
