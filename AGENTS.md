# Dobbit v2 — AGENTS.md

Supabase 의존 구조를 NestJS + PostgreSQL + Prisma + WebSocket 기반 Monorepo로
재설계하는 실시간 금융 서비스.

## 역할 분리

| 역할                                      | 담당      |
| ----------------------------------------- | --------- |
| 설계 검토, 계획 수립, ADR 작성, 작업 지시 | **Codex** |
| 폴더/파일 생성, 기능 구현, 리팩터링, 수정 | **Codex** |

### Codex 행동 규칙 (절대 원칙)

**규모와 무관하게, 소스 파일을 변경하는 모든 작업은 Codex에 위임한다.**

Codex가 직접 해서는 안 되는 것:

- `Edit`, `Write` 도구로 소스 코드 파일 생성·수정
- `Bash`로 소스 파일을 변경하는 명령 실행
- "한 줄 수정이니까 직접 하겠다"는 판단

Codex가 직접 해도 되는 것:

- 파일 **읽기** (`Read`, `Bash cat/grep` 등 조회 전용)
- `AGENTS.md`, `SKILL.md` 등 **하네스 문서** 수정
- `pnpm check-types`, `pnpm lint` 등 **검증 명령** 실행
- Obsidian 작업 로그 **기록**

위임 경로: Codex → implementer 에이전트 → Codex(`codex:rescue` 서브에이전트)

Codex는 Codex의 작업 지시 단위(명확한 입력·출력·완료 기준)를 받아 실행한다.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes,
simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria require
constant clarification.

## 프로젝트 환경

- **패키지 매니저**: pnpm (워크스페이스)
- **빌드 시스템**: Turborepo
- **Node.js**: >=24
- **언어**: TypeScript (strict)

## Monorepo 구조

```
dobbit-v2/
├── apps/
│   ├── web/          # Next.js 16 (App Router) — 렌더링·UX 전담
│   └── api/          # NestJS — Auth, Market, Trade, Wallet, Realtime, Alert, News
├── packages/
│   ├── shared/       # 공통 타입, DTO, WebSocket 이벤트 타입
│   ├── eslint-config/
│   └── typescript-config/
└── docker/           # 로컬 PostgreSQL, Redis
```

## 기술 스택

| 영역   | 기술                                                                      |
| ------ | ------------------------------------------------------------------------- |
| Client | Next.js 16 (App Router), React 19, TailwindCSS, shadcn/ui, React Query    |
| Server | NestJS, Prisma, PostgreSQL, WebSocket (Socket.io), Slack Incoming Webhook |
| Shared | TypeScript 공통 타입, DTO, 이벤트 스키마                                  |
| Infra  | Docker Compose (로컬), Raspberry Pi (운영)                                |

## FSD Barrel Export 규칙 (apps/web)

`apps/web/src/` 하위 모든 layer·slice는 아래 규칙을 반드시 준수한다.

### 컴포넌트 export 방식

- **page/view 컴포넌트** (`views/**/*.tsx`): `export default function` 사용
- **그 외 컴포넌트** (`features`, `widgets`, `entities`): named export 사용
- **이유**: `views/*/index.ts`에서
  `export { default as XxxPage } from './XxxPage'` 패턴을 통일하기 위함

### index.ts export 규칙

**모든 index.ts는 `export * from './...'` 패턴을 사용한다.** 유일한 예외:
`views/*/index.ts` — default export를 named로 재export할 때만
`export { default as XxxPage }` 사용.

### layer별 index.ts 구조

```
views/
├── home/
│   ├── HomePage.tsx        # export default function HomePage()
│   └── index.ts            # export { default as HomePage } from './HomePage';  ← 유일한 예외
└── index.ts                # export * from './home';

features/
├── auth/
│   ├── model/
│   │   └── index.ts        # export * from './usePrivateSocket';
│   └── index.ts            # export * from './model';
├── market/
│   ├── model/
│   │   └── index.ts        # export * from './useMarketSocket';
│   └── index.ts            # export * from './model';
└── index.ts                # export * from './auth'; export * from './market'; ...

shared/
├── api/
│   └── index.ts            # export * from './api-client'; export * from './auth-token'; ...
├── libs/
│   ├── query/
│   │   └── index.ts        # export * from './create-query-client';
│   ├── socket/
│   │   └── index.ts        # export * from './...';
│   └── index.ts            # export * from './query'; export * from './socket';
└── index.ts                # export * from './api'; export * from './libs';
```

### 체크리스트 — slice/layer 추가 시 반드시 확인

1. **slice 추가** (`views/foo`, `features/bar` 등): 해당 slice `index.ts` 작성
   후, **상위 layer `index.ts`에 `export * from './foo'` 추가**
2. **shared/libs 하위 추가**: `shared/libs/index.ts`에
   `export * from './새폴더'` 추가
3. **폴더명**: `shared` 하위 유틸 폴더는 `libs`. 내부 참조 시
   `@/shared/libs/...` 사용
4. **`shared/index.ts`**: `export * from './libs'` 한 줄 — 하위를 개별 참조하지
   않는다

## 도메인 모듈 (NestJS api)

- **Auth** — JWT 기반 인증, 토큰 관리
- **Market** — Upbit API 연동, 내부 ViewModel 변환
- **Trade** — 매수/매도/취소, 서버 측 체결 검증
- **Wallet** — 보유 현금·코인, 이동평균 평단가, 평가손익
- **Realtime** — WebSocket Gateway (공개 시장 채널 / 개인 자산 채널)
- **Alert** — 리스크 조건 평가, WebSocket 인앱 알림, Slack Webhook 발송,
  cooldown 정책
- **News** — 뉴스 수집, Hermes 에이전트 분석, Gemini fallback, PredictionReview,
  LearningSample

## 개발 기록 원칙

- 큰 기술 결정은 **ADR**로 먼저 남긴다.
- 구현 시작 전 목표·완료 기준을 **작업 로그**에 적는다.
- 구현 후 명령어·결과·실패·수정 이유를 **검증 로그**에 남긴다.
- Codex 구현 결과는 Codex가 검토 후 작업 로그에 요약한다.
- 기록 위치: `workspace/project/portfolio-renewal/Dobbit/docs/` (Obsidian vault)

## 완료·리뷰·배포 기본 흐름

기능 구현, 버그 수정, 리팩터링, chore 등 소스 변경 작업은 구현·브랜치 생성 전에 반드시 GitHub issue를 확인하거나 생성한다. 기존 issue가 있으면 그 scope를 따르고, 없으면 repository issue template에 맞춰 생성한다.

브랜치는 최신 `main`을 base로 아래 형식만 사용한다.

```
{type}/{issue_number}-{summary-slug}
```

- 허용 type: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `perf`
- issue 번호는 실제 GitHub issue 번호를 사용한다.
- summary slug는 소문자·숫자·hyphen만 사용한다. 공백, 한글, 특수문자, `#`는 사용하지 않는다.
- `main`, `master`, `develop`, `dev`에서 직접 작업하지 않는다.

PR은 repository PR template을 사용하며, body에 브랜치의 issue 번호를 닫는 keyword(`Closes #<issue>`, `Fixes #<issue>`, 또는 `Resolves #<issue>`)를 반드시 포함한다.

소스 변경 작업이 검증되면 별도 요청 없이 아래 순서를 기본으로 진행한다.

1. GitHub issue를 확인하거나 생성하고, 최신 `main`에서 issue 번호 기반 브랜치를 만든다.
2. 관련 타입·린트·동작 검증을 실행한다.
3. Antigravity CLI(`agy`)를 2차 리뷰어로 우선 사용한다. RTK 환경에서는 인자를 보존하는 `rtk proxy agy --mode plan --sandbox --print --print-timeout=2m --prompt "<인라인 diff 검토 프롬프트>"`로 실행한다. 검토 diff를 프롬프트에 인라인으로 전달하고 파일 경로·쓰기 권한은 주지 않으며 실행 전후 `git status --porcelain`이 같은지 확인한다.
4. Antigravity를 사용할 수 없고 Gemini CLI 인증이 지원되는 경우 Gemini을 read-only fallback으로 사용한다. 둘 다 사용할 수 없으면 Codex가 변경 diff를 코드리뷰한다.
5. 발견 사항을 수정하고 다시 검증·리뷰한다.
6. 작업 범위가 명확하고 사용자 미커밋 변경과 섞이지 않았으면 변경 파일만 stage, commit, push하고, issue closing keyword를 포함한 draft PR을 생성한다.

혼합 작업트리이거나 리뷰에서 수정 범위가 불명확하면 stage·push 전 사용자에게 범위를 확인한다.

## 커밋 컨벤션

```
feat: 새 기능
fix: 버그 수정
refactor: 기능 변경 없는 리팩터링
chore: 빌드·설정 변경
docs: 문서만 변경
test: 테스트만 변경
```

스코프 예시: `feat(api/auth): JWT refresh 구현`,
`feat(web/market): 시세 WebSocket 연결`

## Codex 작업 지시 형식

Codex가 Codex에 작업을 넘길 때 반드시 아래 형식을 사용한다.

```
목표: [한 줄 목표]
작업 위치: [파일/디렉터리 경로]
입력 조건: [전제 조건, 이미 존재하는 파일 등]
완료 기준:
  - [ ] [검증 가능한 조건 1]
  - [ ] [검증 가능한 조건 2]
참고 문서: [ADR 또는 설계 문서 경로]
```

## 하네스: Dobbit v2

**목표:** 마일스톤 단위 작업을 planner → implementer(Codex) → verifier 팀이
자동으로 계획·구현·검증·기록한다.

**트리거:** "Milestone N 진행", "마일스톤 시작", "다음 단계", 특정 도메인
모듈(Auth, Prisma, WebSocket, Alert, News) 구현 요청 시 `dobbit-milestone`
스킬을 사용하라.

**변경 이력:**

| 날짜       | 변경 내용 | 대상 | 사유                            |
| ---------- | --------- | ---- | ------------------------------- |
| 2026-06-14 | 초기 구성 | 전체 | Milestone 2 진행 전 하네스 구축 |
