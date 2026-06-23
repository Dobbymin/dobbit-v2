import { Badge, Button, Skeleton, cn } from "@/shared";
import { ExternalLink } from "lucide-react";

type Props = {
  title: string;
  url: string;
  confidence?: number | null;
  config: {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
  };
  isLoading?: boolean;
};

export const TitleBox = ({ title, url, confidence, config, isLoading }: Props) => {
  const handleOpenLink = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className='flex items-start justify-between gap-4'>
        <div className='flex flex-1 flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-16' />
            <Skeleton className='h-4 w-24' />
          </div>
          <Skeleton className='h-6 w-full' />
          <Skeleton className='h-6 w-3/4' />
        </div>
        <Skeleton className='size-10 shrink-0' />
      </div>
    );
  }

  return (
    <div className='flex items-start justify-between gap-4'>
      <div className='flex flex-1 flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <Badge className={cn("gap-1 border-0 px-2 py-0.5", config.bg, config.color)}>
            {config.icon}
            {config.label}
          </Badge>
          {confidence !== null && confidence !== undefined && (
            <span className='text-xs text-text-muted-dark'>AI 신뢰도 {Math.round(confidence)}%</span>
          )}
        </div>
        <h3 className='text-xl leading-tight font-bold text-white transition-colors group-hover:text-blue-400'>
          {title}
        </h3>
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='shrink-0 text-text-muted-dark hover:bg-white/10 hover:text-white'
        onClick={handleOpenLink}
      >
        <ExternalLink className='size-5' />
      </Button>
    </div>
  );
};
