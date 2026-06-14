# 구현 결과

## 작업 1: shared 알림 계약 보강
- 상태: 성공
- Codex 출력 요약: Slack Webhook 저장 요청, Slack 설정 응답, Slack 테스트 응답, 알림 읽음 응답, 알림 평가 요청/응답 타입을 `@dobbit/shared`에 추가했다. `notification.delivery.failed` payload에는 `userId`, `reason`, `failedAt`을 포함하며 URL 원문은 포함하지 않는다.
- 생성/수정된 파일:
  - `packages/shared/src/dtos/alert.dto.ts`
  - `packages/shared/src/dtos/notification.dto.ts`
  - `packages/shared/src/types/websocket-events.ts`

## 작업 2: Prisma 알림 스키마와 마이그레이션 정합성 확인
- 상태: 성공
- Codex 출력 요약: 기존 schema/migration은 Milestone 5 필수 모델 대부분을 포함하고 있었으나 `Notification.marketId`가 관계/FK 없이 컬럼만 존재했다. `Market.notifications`, `Notification.market` 관계와 `notifications_marketId_idx`, FK 추가 migration을 생성했다.
- 생성/수정된 파일:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/prisma/migrations/002_notification_market_relation/migration.sql`

## 작업 3: 서버 알림 조건 평가 구현
- 상태: 성공
- Codex 출력 요약: `/alert/evaluate`에서 market snapshot을 저장하고 활성 rule을 평가한다. `PRICE_CHANGE_RATE`, `PROFIT_RATE_TARGET`, `LOSS_RATE_LIMIT`, `VOLUME_SPIKE` 평가 경로를 구현했고, 필요한 데이터가 없으면 해당 rule만 skip한다. cooldown 내에서는 새 알림을 만들지 않는다.
- 생성/수정된 파일:
  - `apps/api/src/alert/alert.controller.ts`
  - `apps/api/src/alert/alert.service.ts`
  - `apps/api/src/alert/evaluators/price-change.evaluator.ts`

## 작업 4: 서버 알림 REST API 완성
- 상태: 성공
- Codex 출력 요약: `/alert/notifications`, `/alert/notifications/:id/read`, `/alert/slack`, `/alert/slack/test`를 추가했다. Slack Webhook은 AES-GCM으로 암호화 저장하며 응답에는 enabled, channelName, lastTestedAt, lastErrorMessage만 반환한다.
- 생성/수정된 파일:
  - `apps/api/src/alert/alert.controller.ts`
  - `apps/api/src/alert/alert.service.ts`
  - `apps/api/src/alert/notifiers/slack.notifier.ts`

## 작업 5: WebSocket 인앱 알림과 Slack 실패 이벤트 연결
- 상태: 성공
- Codex 출력 요약: 인앱 알림은 `notification.created`로 사용자 room에 발행하고 WebSocket delivery status를 갱신한다. Slack 발송 결과에 따라 delivery를 `SENT`/`FAILED`로 갱신하며 실패 시 `notification.delivery.failed` 이벤트를 발행한다.
- 생성/수정된 파일:
  - `apps/api/src/alert/alert.service.ts`
  - `apps/api/src/alert/notifiers/slack.notifier.ts`
  - `apps/api/src/alert/notifiers/websocket.notifier.ts`

## 작업 6: 웹 알림 API와 React Query hook 완성
- 상태: 성공
- Codex 출력 요약: 웹 알림 API 경로를 서버의 `/alert/...` 라우트에 맞췄고 Slack 설정 조회/저장/테스트 API와 query/mutation hook을 추가했다. mutation 성공 시 관련 query를 invalidate한다.
- 생성/수정된 파일:
  - `apps/web/src/features/notification/api/notification.api.ts`
  - `apps/web/src/features/notification/model/notification-query-keys.ts`
  - `apps/web/src/features/notification/model/useNotifications.ts`
  - `apps/web/src/features/notification/model/useNotificationToast.ts`
  - `apps/web/src/features/notification/index.ts`

## 작업 7: 웹 알림 센터, 토스트, Slack 설정 UI 연결
- 상태: 성공
- Codex 출력 요약: Home 화면에 알림 목록/알림 센터/토스트/Slack 설정 패널을 연결했다. WebSocket `notification.created`는 toast와 notification query 갱신으로, `notification.delivery.failed`는 toast와 Slack 설정 query 갱신으로 처리한다. Slack URL 입력은 password field이며 저장 성공 후 값을 비운다.
- 생성/수정된 파일:
  - `apps/web/src/features/auth/model/usePrivateSocket.ts`
  - `apps/web/src/features/notification/ui/SlackIntegrationSettings.tsx`
  - `apps/web/src/features/notification/ui/index.ts`
  - `apps/web/src/views/home/HomePage.tsx`

## 작업 8: 검증과 구현 결과 기록
- 상태: 부분 성공
- 실행한 명령과 결과:
  - `pnpm --filter api exec prisma generate --schema apps/api/prisma/schema.prisma`: 실패. `--filter api exec`가 실행 위치를 `apps/api`로 바꿔 상대 경로 `apps/api/prisma/schema.prisma`를 찾지 못함.
  - `pnpm --filter api exec prisma generate --schema prisma/schema.prisma`: 성공.
  - `pnpm --filter api build`: 성공.
  - `pnpm --filter api lint`: 실패. 이번 작업의 `apps/api/src/alert/**` 오류는 정리됐고, 기존 `app.controller.spec.ts`, `auth`, `market`, `news`, `realtime`, `trade`, `wallet` 영역의 strict lint/prettier 오류 109건이 남아 있음.
  - `pnpm --filter web typecheck`: 성공.
  - `pnpm --filter web lint`: 성공.
  - `pnpm check-types`: 성공. 현재 turbo 설정상 `@repo/ui` check-types만 실행됨.
- 미해결 항목:
  - API 전체 lint는 기존 스켈레톤 코드의 `require-await`, unused vars, unsafe any, 일부 prettier 오류 때문에 실패한다.
  - 실제 Slack 테스트 발송은 유효한 사용자 인증, `ENCRYPTION_KEY`, 저장된 Webhook URL이 있어야 런타임에서 성공한다.
- secret 기록 여부: Webhook URL, 토큰, secret 원문은 결과 문서와 응답에 기록하지 않았다.
