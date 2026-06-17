import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

export const getSentimentConfig = (sentiment?: string | null) => {
  const normalized = sentiment?.toLowerCase();

  switch (normalized) {
    case 'positive':
      return {
        label: '호재',
        icon: <TrendingUp className='size-4' />,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
      };
    case 'negative':
      return {
        label: '악재',
        icon: <TrendingDown className='size-4' />,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
      };
    default:
      return {
        label: '중립',
        icon: <Minus className='size-4' />,
        color: 'text-gray-500',
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/20',
      };
  }
};
