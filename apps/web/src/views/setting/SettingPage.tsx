import { NewsAlertSettings } from "@/features/alert";
import { SlackIntegrationSettings } from "@/features/notification";
import { ProfileSection, UserInfoSection } from "@/features/setting";

export default function SettingPage() {
  return (
    <div className='px-4 pb-6 lg:px-10'>
      <div className='flex w-full max-w-4xl flex-col gap-8 px-5 py-10'>
        <h1 className='text-2xl font-bold text-foreground'>프로필 설정</h1>

        <div className='flex flex-col gap-8 md:flex-row md:items-start'>
          <ProfileSection />
          <UserInfoSection />
        </div>

        <div className='space-y-5'>
          <SlackIntegrationSettings />
          <NewsAlertSettings />
        </div>
      </div>
    </div>
  );
}
