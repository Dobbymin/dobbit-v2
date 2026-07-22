import { TradePage } from "@/views/trade";

export default async function Page({ params }: { params: Promise<{ marketCode: string }> }) {
  const { marketCode } = await params;
  return <TradePage marketCode={decodeURIComponent(marketCode)} />;
}
