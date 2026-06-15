import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground'>
      <section className='w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold tracking-normal'>로그인</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Dobbit 계정으로 접속합니다.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
