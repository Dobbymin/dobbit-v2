import { AppLayout } from "@/widgets";

import { NewsAlertSettings } from "@/features/alert";
import { SlackIntegrationSettings } from "@/features/notification";
import { ProfileSection } from "@/features/setting";

export default function SettingPage() {
  return (
    <AppLayout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-normal'>설정</h1>
          <p className='mt-2 text-sm text-muted-foreground'>프로필과 알림 연동을 관리합니다.</p>
        </div>
        <div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
          <ProfileSection />
          <div className='space-y-5'>
            <SlackIntegrationSettings />
            <NewsAlertSettings />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
