import { TradePage } from "@/views/trade";

type TradeDetailPageProps = {
  params: Promise<{
    marketCode: string;
  }>;
};

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
  const { marketCode } = await params;

  return <TradePage marketCode={decodeURIComponent(marketCode)} />;
}
