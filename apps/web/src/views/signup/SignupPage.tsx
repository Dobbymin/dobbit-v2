import { SignupForm } from "@/features/auth";

export default function SignupPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground'>
      <section className='w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold tracking-normal'>회원가입</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Dobbit에서 모의 투자를 시작합니다.</p>
        </div>
        <SignupForm />
      </section>
    </main>
  );
}
