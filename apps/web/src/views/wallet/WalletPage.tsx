import { CashSection, HeldAssetsListSection, StatsAreaSection } from '@/features/wallet';
import { AppLayout } from '@/widgets';

export default function WalletPage() {
  return (
    <AppLayout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-normal'>지갑</h1>
          <p className='mt-2 text-sm text-muted-foreground'>보유 현금과 자산 평가 현황을 확인합니다.</p>
        </div>
        <StatsAreaSection />
        <CashSection />
        <HeldAssetsListSection />
      </div>
    </AppLayout>
  );
}
