# Dobbit v2 — CLAUDE.md

Supabase 의존 구조를 NestJS + PostgreSQL + Prisma + WebSocket 기반 Monorepo로 재설계하는 실시간 금융 서비스.

## 역할 분리

| 역할                                      | 담당            |
| ----------------------------------------- | --------------- |
| 설계 검토, 계획 수립, ADR 작성, 작업 지시 | **Claude Code** |
| 폴더/파일 생성, 기능 구현, 리팩터링, 수정 | **Codex**       |

Claude Code는 구현 코드를 직접 작성하지 않는다.
Codex는 Claude Code의 작업 지시 단위(명확한 입력·출력·완료 기준)를 받아 실행한다.

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

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

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

Strong success criteria let you loop independently. Weak criteria require constant clarification.

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

## 도메인 모듈 (NestJS api)

- **Auth** — JWT 기반 인증, 토큰 관리
- **Market** — Upbit API 연동, 내부 ViewModel 변환
- **Trade** — 매수/매도/취소, 서버 측 체결 검증
- **Wallet** — 보유 현금·코인, 이동평균 평단가, 평가손익
- **Realtime** — WebSocket Gateway (공개 시장 채널 / 개인 자산 채널)
- **Alert** — 리스크 조건 평가, WebSocket 인앱 알림, Slack Webhook 발송, cooldown 정책
- **News** — 뉴스 수집, Hermes 에이전트 분석, Gemini fallback, PredictionReview, LearningSample

## 개발 기록 원칙

- 큰 기술 결정은 **ADR**로 먼저 남긴다.
- 구현 시작 전 목표·완료 기준을 **작업 로그**에 적는다.
- 구현 후 명령어·결과·실패·수정 이유를 **검증 로그**에 남긴다.
- Codex 구현 결과는 Claude Code가 검토 후 작업 로그에 요약한다.
- 기록 위치: `workspace/project/portfolio-renewal/Dobbit/docs/` (Obsidian vault)

## 커밋 컨벤션

```
feat: 새 기능
fix: 버그 수정
refactor: 기능 변경 없는 리팩터링
chore: 빌드·설정 변경
docs: 문서만 변경
test: 테스트만 변경
```

스코프 예시: `feat(api/auth): JWT refresh 구현`, `feat(web/market): 시세 WebSocket 연결`

## Codex 작업 지시 형식

Claude Code가 Codex에 작업을 넘길 때 반드시 아래 형식을 사용한다.

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

**목표:** 마일스톤 단위 작업을 planner → implementer(Codex) → verifier 팀이 자동으로 계획·구현·검증·기록한다.

**트리거:** "Milestone N 진행", "마일스톤 시작", "다음 단계", 특정 도메인 모듈(Auth, Prisma, WebSocket, Alert, News) 구현 요청 시 `dobbit-milestone` 스킬을 사용하라.

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-14 | 초기 구성 | 전체 | Milestone 2 진행 전 하네스 구축 |
