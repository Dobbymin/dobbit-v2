---
name: dobbit-milestone
description:
  "Dobbit v2 마일스톤 실행 오케스트레이터. 'Milestone N 진행', '마일스톤 시작',
  '다음 단계 진행', '서버 구축 시작' 같은 요청이나 특정 도메인 모듈(Auth,
  Prisma, WebSocket, Alert, News) 구현 요청 시 반드시 이 스킬을 사용한다.
  planner → implementer → verifier 팀이 계획·구현·검증·Obsidian 기록을 순서대로
  담당한다."
---

# Dobbit Milestone Orchestrator

Dobbit v2의 마일스톤을 planner → implementer → verifier 파이프라인으로 실행한다.

## 절대 규칙: Claude Code는 코드를 직접 작성하지 않는다

**이 규칙은 요청 규모와 무관하게 예외 없이 적용된다.**

Claude Code(오케스트레이터)가 절대 하면 안 되는 것:

- `Edit`, `Write` 도구로 소스 파일 생성·수정
- `Bash`로 소스 파일을 변경하는 명령 실행
- "간단한 수정이니까 직접 하겠다"는 판단

모든 파일 변경은 반드시 **implementer → Codex(`codex:rescue`)** 경로로 위임한다.

Claude Code가 직접 해도 되는 것:

- 파일 **읽기** (`Read`, `Bash cat/grep`)
- `CLAUDE.md`, `SKILL.md` 등 **하네스 문서** 수정
- `pnpm check-types` 같은 **검증 명령** 실행
- Obsidian 작업 로그 **기록**

---

## Phase 0: 컨텍스트 확인

시작 전 기존 작업 상태를 확인한다.

```bash
ls /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/ 2>/dev/null || echo "신규 실행"
cat /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/progress.md 2>/dev/null || echo "진행 이력 없음"
```

- `_workspace/` 없음 → **초기 실행**
- `progress.md`에 중단된 Phase가 기록되어 있으면 → **해당 Phase부터 재개**
- `_workspace/` 있고 새 마일스톤 → `_workspace/`를 `_workspace_prev/`로 이동 후
  **새 실행**

## Phase 1: 팀 구성

에이전트 팀 모드로 실행한다.

```
TeamCreate(
  team_name: "dobbit-team",
  members: ["planner", "implementer", "verifier"]
)
```

팀 구성 직후 진행 상태를 파일에 기록한다:

```bash
mkdir -p /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace
echo "Phase 1 완료 — 팀 구성됨 $(date)" >> /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/progress.md
```

각 에이전트 정의 파일:

- `.claude/agents/planner.md`
- `.claude/agents/implementer.md`
- `.claude/agents/verifier.md`

## Phase 2: 계획 (planner)

planner에게 마일스톤 번호와 현재 상태를 전달한다.

```
SendMessage(
  to: "planner",
  message: """
마일스톤: [사용자 요청에서 파악한 마일스톤명]
현재 상태: [apps/, packages/ 구조 요약]
실행 계획서: /Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/Dobbit 실행 계획서.md
CLAUDE.md: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/CLAUDE.md
산출물 경로: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/plan.md
"""
)
```

planner로부터 "plan_ready" 수신 후:

```bash
echo "Phase 2 완료 — plan.md 작성됨 $(date)" >> /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/progress.md
```

## Phase 3: 구현 (implementer)

```
SendMessage(
  to: "implementer",
  message: """
plan.md 경로: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/plan.md
프로젝트 루트: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2
산출물 경로: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/impl_result.md
"""
)
```

implementer로부터 "impl_done" 수신 후:

```bash
echo "Phase 3 완료 — 구현 완료 $(date)" >> /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/progress.md
```

## Phase 4: 검증 (verifier)

```
SendMessage(
  to: "verifier",
  message: """
plan.md: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/plan.md
impl_result.md: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/impl_result.md
프로젝트 루트: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2
Obsidian 로그 경로: /Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/작업로그/
오늘 날짜: [현재 날짜 YYYY-MM-DD]
"""
)
```

verifier로부터 "verify_done" 수신 후:

```bash
echo "Phase 4 완료 — 검증 완료 $(date)" >> /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/progress.md
```

## Phase 5: 종합 보고

사용자에게 최종 결과를 보고한다:

```markdown
## [마일스톤명] 완료 보고

### 완료된 작업

- [완료 기준 체크리스트]

### 검증 결과

- 타입 체크: 통과 / 오류 N개
- 린트: 통과 / 경고 N개

### 다음 단계

- [다음 마일스톤 제안]

### Obsidian 기록

- [작업 로그 파일 경로]
```

## Phase 6: 팀 정리 ← 절대 생략 금지

**이 Phase는 성공, 실패, 에러 여부와 관계없이 반드시 실행한다.** Phase 2~5 중
어디서 실패하더라도 Phase 6으로 점프하여 팀을 정리한다.

### TeamDelete 직접 호출

에이전트에게 종료 메시지를 보내거나 응답을 기다리지 않는다. 오케스트레이터가
즉시 호출한다:

```
TeamDelete()
```

### TeamDelete 실패 시

TeamDelete가 실패하면 사용자에게 다음을 안내한다:

```
팀 자동 정리에 실패했습니다.
Claude Code UI의 "실행 중" 목록에서 planner, implementer, verifier 에이전트 옆
체크박스를 클릭하여 직접 종료해 주세요.
```

### 정리 완료 기록

```bash
echo "Phase 6 완료 — 팀 정리됨 $(date)" >> /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/progress.md
```

---

## 에러 핸들링

모든 에러 상황에서 Phase 6(팀 정리)을 반드시 실행한다.

- **planner 실패**: 실행 계획서 경로 재확인 후 1회 재시도 → 재실패 시 Phase
  6으로 점프
- **Codex 실패**: impl_result.md에 실패 내용 기록 후 Phase 4(검증)로 진행 →
  Phase 6으로 점프
- **검증 실패**: verify_result.md 내용을 사용자에게 보고 → Phase 6으로 점프
- **세션 컨텍스트 초과 우려**: Phase마다 progress.md에 상태 기록. 다음 세션에서
  Phase 0이 progress.md를 읽어 재개 지점을 파악

## 테스트 시나리오

**정상 흐름:**

1. "Milestone 2 진행해줘" → planner가 plan.md 작성 → implementer가 Codex 위임 →
   verifier가 검증 + Obsidian 기록 → 완료 보고 → **Phase 6: TeamDelete 즉시
   호출**

**에러 흐름:**

1. Codex 빌드 오류 → impl_result.md에 실패 기록 → verifier가 오류 포함하여
   Obsidian 기록 → 사용자에게 보고 → **Phase 6: TeamDelete 즉시 호출**

**세션 재시작 흐름:**

1. 이전 세션에서 Phase 3(구현 중) 중단 → 새 세션에서 스킬 재실행 → Phase 0이
   progress.md 확인 → "Phase 3 재개"로 시작
