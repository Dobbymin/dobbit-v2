import { EmailField, LastLoginField, NicknameField } from "../components";

export const UserInfoSection = () => {
  return (
    <section className='flex w-full flex-col items-start justify-center gap-6 bg-surface-dark p-9'>
      <EmailField />
      <NicknameField />
      <LastLoginField />
    </section>
  );
};
