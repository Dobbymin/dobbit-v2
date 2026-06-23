import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export const getSentimentConfig = (sentiment?: string | null) => {
  const normalized = sentiment?.toLowerCase();

  switch (normalized) {
    case "positive":
      return {
        label: "호재",
        icon: <TrendingUp className='size-4' />,
        color: "text-positive",
        bg: "bg-positive/10",
        border: "border-positive/20",
      };
    case "negative":
      return {
        label: "악재",
        icon: <TrendingDown className='size-4' />,
        color: "text-negative",
        bg: "bg-negative/10",
        border: "border-negative/20",
      };
    default:
      return {
        label: "중립",
        icon: <Minus className='size-4' />,
        color: "text-text-muted-dark",
        bg: "bg-text-muted-dark/10",
        border: "border-text-muted-dark/20",
      };
  }
};
