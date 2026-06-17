# 구현 결과: Dobbit v1 공개 거래 대시보드 복원

상태: DONE_WITH_CONCERNS

## 변경 요약

- `/`, `/news`, `/market`, `/login`, `/signup`을 비로그인 public route로 허용했다.
- `/wallet`, `/setting`은 비로그인 접근 시 `/login?from=...`으로 redirect되도록 유지했다.
- HomePage에서 private notification/socket 중심 UI를 제거하고, v1 스타일의 시장 목록 + 차트/컨트롤 + 주문 패널 구조로 교체했다.
- Header main nav를 `Dashboard`, `Auto Trade`, `News`, `Setting`으로 정렬하고, `Wallet`은 우측 액션으로 유지했다.
- market client endpoint를 NestJS controller 경로인 `/api/market/markets`, `/api/market/markets/:code/price`에 맞췄다.
- Tailwind/shadcn token을 v1 dark trading terminal 톤에 맞게 조정했다.

## 변경 파일

- `apps/web/middleware.ts`
- `apps/web/app/globals.css`
- `apps/web/src/shared/api/api-client.ts`
- `apps/web/src/features/market/api/market.api.ts`
- `apps/web/src/features/market/index.ts`
- `apps/web/src/features/market/ui/MarketChartPanel.tsx`
- `apps/web/src/features/market/ui/MarketListPanel.tsx`
- `apps/web/src/features/market/ui/MarketOrderPanel.tsx`
- `apps/web/src/features/market/ui/index.ts`
- `apps/web/src/views/home/HomePage.tsx`
- `apps/web/src/widgets/header/ui/Header.tsx`
- `apps/web/src/widgets/header/ui/LogoButton.tsx`
- `apps/web/src/widgets/header/ui/NavButton.tsx`
- `apps/web/src/widgets/header/ui/UserMenuButton.tsx`

## 검증 결과

- `pnpm --filter web typecheck`: 성공
- `pnpm --filter web lint`: 성공
- `curl -I http://localhost:3000/`: `200 OK`
- `curl -I http://localhost:3000/news`: `200 OK`
- `curl -I http://localhost:3000/wallet`: `307 Temporary Redirect`, `location: /login?from=%2Fwallet`
- `curl -I http://localhost:3000/setting`: `307 Temporary Redirect`, `location: /login?from=%2Fsetting`

## 미해결/주의 사항

- `pnpm --filter web dev`는 sandbox에서 `EPERM`으로 실패했고, 승인 후 재시도 시 기존 Next dev server lock 때문에 3000 포트 사용 중으로 보고되었다. 기존 서버에 대해 curl 검증은 승인 권한으로 성공했다.
- 차트는 v1 UX 복원을 위한 placeholder다. 현재 계획 범위에 candle/chart endpoint 연동은 포함하지 않았다.
- 주문 패널은 public dashboard에서 보이지만 protected trade API를 호출하지 않는다. 로그인 전에는 login 링크, 로그인 후에도 실제 주문 실행은 disabled 상태다.
- 기존 공개 사이트/브라우저 시각 비교는 수행하지 않았다. 구현은 제공된 v1 로컬 소스 구조와 계획 문서를 기준으로 맞췄다.
