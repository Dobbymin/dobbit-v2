import { ROUTES_PATH } from "@/shared";
import { AppLayout, PageFallback } from "@/widgets";

export default function NotFound() {
  return (
    <AppLayout>
      <PageFallback
        action={{ href: ROUTES_PATH.HOME, label: "홈으로" }}
        description='주소가 바뀌었거나 삭제된 페이지입니다.'
        title='페이지를 찾을 수 없습니다'
      />
    </AppLayout>
  );
}
