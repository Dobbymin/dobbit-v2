# Milestone 5: 대표 기능 구현(실시간 리스크 알림) 작업 계획

## 현재 상태 요약

- 프로젝트 루트는 `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2`이며 pnpm workspace 기반 monorepo다.
- `apps/api`, `apps/web`, `packages/shared`, `packages/ui`, `packages/eslint-config`, `packages/typescript-config`가 존재한다.
- 작업 트리는 dirty 상태다. 구현자는 기존 변경을 되돌리거나 정리하지 말고 현재 상태 위에서 필요한 파일만 수정한다.
- `apps/api/prisma/schema.prisma`에는 `AlertRule`, `Notification`, `NotificationDelivery`, `SlackIntegration` 모델이 이미 있다.
- `apps/api/src/alert`에는 `AlertController`, `AlertService`, `PriceChangeEvaluator`, `SlackNotifier`, `WebSocketNotifier`가 이미 있다.
- `apps/api/src/realtime`에는 사용자 room으로 이벤트를 발행하는 `RealtimeService`와 `private:join` WebSocket gateway가 이미 있다.
- `packages/shared/src/dtos/alert.dto.ts`, `packages/shared/src/dtos/notification.dto.ts`, `packages/shared/src/types/websocket-events.ts`가 이미 있다.
- `apps/web/src/features/notification`에는 알림 조회 API, query hook, 토스트 hook, `NotificationCenter`, `NotificationToast` skeleton이 이미 있다.
- 현재 누락된 최소 구현은 서버의 조건 평가 진입점, Slack 설정/테스트 API, 알림 조회/읽음 API, Slack 실패 이벤트/기록 보강, 웹 Slack 설정 UI와 홈 화면 연결이다.

## 공통 구현 원칙

- 기존 dirty 변경을 절대 되돌리지 않는다.
- 구현 범위는 Milestone 5의 최소 검증 가능 구현으로 제한한다.
- 뉴스 감성 알림은 이번 단계에서 타입/확장 후보로만 유지하고 실제 평가 구현은 하지 않는다.
- Webhook URL은 화면에 재노출하지 않고 로그에도 출력하지 않는다.
- `apps/web/src` 하위 FSD barrel 규칙을 지킨다.
- 새 index.ts는 `export * from './...'` 패턴을 사용한다. 단, `views/*/index.ts`의 default named re-export 예외는 유지한다.

## 작업 목록 (순서 중요)

### 작업 1: shared 알림 계약 보강

목표: 서버와 웹이 함께 사용할 알림, Slack 설정, 평가 입력/출력 타입을 보강한다.
작업 위치: `packages/shared/src/dtos/alert.dto.ts`, `packages/shared/src/dtos/notification.dto.ts`, `packages/shared/src/types/websocket-events.ts`, `packages/shared/src/index.ts`
입력 조건: 기존 `AlertRule`, `NotificationItem`, `NotificationCreatedEvent`, `NotificationDeliveryFailedEvent` 타입이 존재한다.
완료 기준:
  - [ ] Slack Webhook 등록 요청, Slack 설정 응답, 테스트 발송 응답 타입이 `packages/shared`에서 export된다.
  - [ ] 알림 읽음 처리 응답 또는 요청 타입이 `packages/shared`에서 export된다.
  - [ ] `notification.delivery.failed` 이벤트 payload가 Slack 실패 사유를 URL 없이 전달하도록 정의되어 있다.
  - [ ] 기존 `NotificationCreatedEvent`와 `NotificationItem` 타입이 서버/웹 요구사항과 충돌하지 않는다.
  - [ ] `pnpm --filter @dobbit/shared build` 또는 공유 패키지에 build script가 없으면 `pnpm check-types`에서 shared 타입 오류가 없어야 한다.
참고 문서: `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/WebSocket 이벤트 설계.md`, `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/알림 설계.md`

### 작업 2: Prisma 알림 스키마와 마이그레이션 정합성 확인

목표: Milestone 5에 필요한 DB 모델이 Prisma schema와 migration에 재현 가능하게 반영되어 있는지 확인하고, 누락이 있으면 마이그레이션을 추가한다.
작업 위치: `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/`
입력 조건: 현재 schema에는 `AlertRule`, `Notification`, `NotificationDelivery`, `SlackIntegration` 모델이 있다.
완료 기준:
  - [ ] `AlertRule`이 사용자, 마켓, 조건 타입, 임계값, 비교 연산, 활성 여부, 채널 선택, cooldown, `lastTriggeredAt`을 저장한다.
  - [ ] `Notification`이 사용자, 알림 규칙, 마켓, 제목, 메시지, severity, payload, readAt, createdAt을 저장한다.
  - [ ] `NotificationDelivery`가 채널별 `PENDING/SENT/FAILED`, 실패 메시지, 발송 시각을 저장한다.
  - [ ] `SlackIntegration`이 사용자별 encrypted webhook, enabled, lastTestedAt, lastErrorMessage를 저장한다.
  - [ ] schema와 기존 migration이 다르면 새 migration이 추가되고, 기존 migration 파일은 되돌리거나 임의 수정하지 않는다.
  - [ ] `pnpm --filter api exec prisma generate --schema apps/api/prisma/schema.prisma`가 성공한다.
참고 문서: `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/ADR/004-websocket-slack-alert.md`, `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/알림 설계.md`

### 작업 3: 서버 알림 조건 평가 구현

목표: 시세/자산 데이터를 기준으로 활성 AlertRule을 평가하고 cooldown 안에서는 중복 발송하지 않는다.
작업 위치: `apps/api/src/alert/alert.service.ts`, `apps/api/src/alert/evaluators/`, 필요 시 `apps/api/src/alert/dto/alert.dto.ts`
입력 조건: `AlertService` CRUD와 `PriceChangeEvaluator` skeleton이 존재하고, Prisma 모델에 `AlertRule`, `Wallet`, `MarketSnapshot`이 있다.
완료 기준:
  - [ ] `PRICE_CHANGE_RATE`, `PROFIT_RATE_TARGET`, `LOSS_RATE_LIMIT`, `VOLUME_SPIKE` 중 최소 검증 가능한 평가 경로가 구현된다.
  - [ ] 구현 범위에서 실제 데이터가 부족한 조건은 명시적으로 skip되며 예외로 전체 평가를 중단하지 않는다.
  - [ ] 조건 비교는 `GTE`, `LTE`를 사용한다.
  - [ ] `lastTriggeredAt + cooldownSeconds` 안에서는 `Notification`과 `NotificationDelivery`가 새로 생성되지 않는다.
  - [ ] 조건 충족 시 `createNotification` 또는 동등한 내부 경로로 WebSocket/Slack 발송 기록을 생성한다.
  - [ ] 평가 메서드는 market ticker/snapshot 입력으로 호출 가능하며, 컨트롤러 또는 서비스에서 수동 검증 가능한 진입점이 있다.
  - [ ] URL, 토큰, Webhook 원문이 로그/에러 메시지에 남지 않는다.
참고 문서: `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/알림 설계.md`

### 작업 4: 서버 알림 REST API 완성

목표: 알림 조건 CRUD 외에 알림 센터 조회/읽음 처리와 Slack 설정/테스트 발송 API를 제공한다.
작업 위치: `apps/api/src/alert/alert.controller.ts`, `apps/api/src/alert/alert.service.ts`, `apps/api/src/alert/notifiers/slack.notifier.ts`, 필요 시 `apps/api/src/alert/dto/alert.dto.ts`
입력 조건: `JwtAuthGuard`가 있고 기존 AlertController는 `/alert/rules` CRUD를 제공한다.
완료 기준:
  - [ ] 로그인 사용자 기준 알림 목록 조회 API가 있고 `NotificationListResponse` 형태를 반환한다.
  - [ ] unreadOnly, marketCode, page, limit 중 최소 unreadOnly와 기본 pagination이 지원된다.
  - [ ] 알림 읽음 처리 API가 있고 다른 사용자의 알림을 읽음 처리할 수 없다.
  - [ ] Slack Webhook 등록/수정 API가 URL을 암호화해 저장하고 응답에 원문 URL을 포함하지 않는다.
  - [ ] Slack 설정 조회 API가 enabled, channelName, lastTestedAt, lastErrorMessage만 반환하고 원문 URL을 포함하지 않는다.
  - [ ] Slack 테스트 발송 API가 실제 Incoming Webhook으로 테스트 메시지를 보내고 `lastTestedAt`, `lastErrorMessage`를 갱신한다.
  - [ ] Slack 실패 시 `NotificationDelivery` 또는 SlackIntegration 실패 상태에 URL 없이 실패 사유가 남는다.
  - [ ] 라우트 경로는 웹 skeleton과 맞게 `/alert/...`로 통일하거나, 웹 API 클라이언트도 같은 경로로 함께 갱신한다.
참고 문서: `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/ADR/004-websocket-slack-alert.md`, `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/알림 설계.md`

### 작업 5: WebSocket 인앱 알림과 Slack 실패 이벤트 연결

목표: 알림 생성은 `notification.created`로 사용자 room에 전송하고, Slack 발송 실패는 `notification.delivery.failed`로 전송한다.
작업 위치: `apps/api/src/alert/notifiers/websocket.notifier.ts`, `apps/api/src/alert/notifiers/slack.notifier.ts`, `apps/api/src/alert/alert.service.ts`, `apps/api/src/realtime/realtime.service.ts`
입력 조건: `RealtimeService.emitToUser(userId, event)`와 `WebSocketNotifier.notify(event)`가 존재한다.
완료 기준:
  - [ ] 인앱 채널이 켜진 알림은 `notification.created` 이벤트를 `user:{userId}` room으로 발행한다.
  - [ ] Slack 채널이 켜진 알림은 Slack 발송 결과에 따라 delivery status를 `SENT` 또는 `FAILED`로 갱신한다.
  - [ ] Slack 실패 시 `notification.delivery.failed` 이벤트가 사용자 room으로 발행된다.
  - [ ] WebSocket delivery 실패도 `FAILED`로 기록되며 전체 알림 생성 트랜잭션을 깨지 않는다.
  - [ ] 이벤트 payload는 `packages/shared` 타입과 일치한다.
참고 문서: `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/WebSocket 이벤트 설계.md`

### 작업 6: 웹 알림 API와 React Query hook 완성

목표: 웹에서 알림 목록, 읽음 처리, Slack 설정 조회/등록/테스트 발송을 호출할 수 있게 한다.
작업 위치: `apps/web/src/features/notification/api/`, `apps/web/src/features/notification/model/`, `apps/web/src/features/notification/index.ts`
입력 조건: 기존 `notification.api.ts`, `useNotifications.ts`, `notification-query-keys.ts`가 존재한다.
완료 기준:
  - [ ] 알림 조회/읽음 API 경로가 서버의 실제 경로와 일치한다.
  - [ ] Slack 설정 조회, Webhook 저장, 테스트 발송 API 함수가 있다.
  - [ ] Slack 설정용 query/mutation hook이 있고 성공 시 관련 query를 invalidate한다.
  - [ ] notification feature의 `api/index.ts`, `model/index.ts`, `index.ts` barrel export가 FSD 규칙을 지킨다.
  - [ ] 타입은 `packages/shared`에서 가져오며 중복 로컬 타입을 최소화한다.
참고 문서: `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/AGENTS.md`, `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/알림 설계.md`

### 작업 7: 웹 알림 센터, 토스트, Slack 설정 UI 연결

목표: 홈 화면에서 알림 센터와 토스트가 동작하고, Slack Webhook 등록 및 테스트 발송 UI를 제공한다.
작업 위치: `apps/web/src/features/notification/ui/`, `apps/web/src/views/home/HomePage.tsx`, 필요 시 `apps/web/src/widgets/` 또는 `apps/web/src/features/notification/`
입력 조건: `NotificationCenter`, `NotificationToast`, `useNotificationToast`, `usePrivateSocket` skeleton이 존재한다.
완료 기준:
  - [ ] 홈 화면 또는 기존 앱 첫 화면에서 `NotificationCenter`가 알림 목록과 unread count를 표시한다.
  - [ ] WebSocket `notification.created` 수신 시 토스트가 표시되고 알림 query가 갱신된다.
  - [ ] `notification.delivery.failed` 수신 시 Slack 실패 상태가 사용자에게 표시되거나 Slack 설정 query가 갱신된다.
  - [ ] Slack Webhook 등록 UI는 원문 URL을 저장 후 다시 노출하지 않고, 저장 완료/실패 상태만 표시한다.
  - [ ] Slack 테스트 발송 버튼이 있고 성공/실패 결과와 마지막 테스트 시각을 표시한다.
  - [ ] 컴포넌트 export 방식은 AGENTS.md 규칙을 지킨다. `features`/`widgets` 컴포넌트는 named export를 사용한다.
  - [ ] 새 slice 또는 폴더를 추가했다면 상위 `index.ts`에 `export * from './...'`가 추가되어 있다.
  - [ ] 텍스트가 버튼/패널 내부에서 넘치거나 겹치지 않는다.
참고 문서: `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/AGENTS.md`, `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/알림 설계.md`

### 작업 8: 검증과 구현 결과 기록

목표: Milestone 5 최소 구현이 타입, 빌드, 린트 기준을 통과하고 구현 결과를 후속 verifier가 확인할 수 있게 기록한다.
작업 위치: `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/impl_result.md`, 프로젝트 루트
입력 조건: 작업 1~7이 완료되어 있다.
완료 기준:
  - [ ] `pnpm --filter api build`가 성공한다.
  - [ ] `pnpm --filter api lint`가 성공하거나, 실패 시 기존 오류와 신규 오류를 구분해 기록한다.
  - [ ] `pnpm --filter web typecheck`가 성공한다.
  - [ ] `pnpm --filter web lint`가 성공하거나, 실패 시 기존 오류와 신규 오류를 구분해 기록한다.
  - [ ] `pnpm check-types`가 성공하거나, 실패 시 원인과 미해결 항목을 기록한다.
  - [ ] 구현자는 `_workspace/impl_result.md`에 변경 파일 목록, 실행한 명령, 결과, 남은 이슈를 기록한다.
  - [ ] Webhook URL 또는 토큰 같은 secret이 로그, 테스트 출력, 문서에 포함되지 않는다.
참고 문서: `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/AGENTS.md`

## 권장 구현 순서

1. shared 타입 보강 후 API/웹 컴파일 기준을 맞춘다.
2. DB schema/migration drift를 확인한다.
3. 서버 REST API와 Slack 암호화/테스트 발송을 완성한다.
4. 서버 조건 평가와 발송 기록/cooldown을 연결한다.
5. WebSocket `notification.created`, `notification.delivery.failed`를 연결한다.
6. 웹 API/hook을 서버 경로에 맞춘다.
7. 홈 화면에 알림 센터, 토스트, Slack 설정 UI를 연결한다.
8. 검증 명령을 실행하고 `_workspace/impl_result.md`를 작성한다.

## 최종 검증 명령

```bash
pnpm --filter api exec prisma generate --schema apps/api/prisma/schema.prisma
pnpm --filter api build
pnpm --filter api lint
pnpm --filter web typecheck
pnpm --filter web lint
pnpm check-types
```

