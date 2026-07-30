"use client";

import { PageFallback } from "@/widgets";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className='px-4 pb-6 lg:px-10'>
      <PageFallback
        action={{ onClick: reset, label: "다시 시도" }}
        description='잠시 후 다시 시도해 주세요.'
        title='문제가 발생했습니다'
      />
    </div>
  );
}
