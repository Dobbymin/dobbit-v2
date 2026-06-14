---
name: dobbit-milestone
description: "Dobbit v2 마일스톤 실행 오케스트레이터. 'Milestone N 진행', '마일스톤 시작', '다음 단계 진행', '서버 구축 시작' 같은 요청이나 특정 도메인 모듈(Auth, Prisma, WebSocket, Alert, News) 구현 요청 시 반드시 이 스킬을 사용한다. planner → implementer → verifier 팀이 계획·구현·검증·Obsidian 기록을 순서대로 담당한다."
---

# Dobbit Milestone Orchestrator

Dobbit v2의 마일스톤을 planner → implementer → verifier 파이프라인으로 실행한다.

## 절대 규칙: Codex는 코드를 직접 작성하지 않는다

**이 규칙은 요청 규모와 무관하게 예외 없이 적용된다.**

Codex(오케스트레이터)가 절대 하면 안 되는 것:
- `Edit`, `Write` 도구로 소스 파일 생성·수정
- `Bash`로 소스 파일을 변경하는 명령 실행
- "간단한 수정이니까 직접 하겠다"는 판단

모든 파일 변경은 반드시 **implementer → Codex(`codex:rescue`)** 경로로 위임한다.

Codex가 직접 해도 되는 것:
- 파일 **읽기** (`Read`, `Bash cat/grep`)
- `AGENTS.md`, `SKILL.md` 등 **하네스 문서** 수정
- `pnpm typecheck` 같은 **검증 명령** 실행
- Obsidian 작업 로그 **기록**

---

## Phase 0: 컨텍스트 확인

시작 전 기존 작업 상태를 확인한다.

```bash
ls /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/ 2>/dev/null || echo "신규 실행"
```

- `_workspace/` 없음 → **초기 실행**
- `_workspace/` 있고 사용자가 "다시"/"수정" 요청 → **부분 재실행** (해당 단계만)
- `_workspace/` 있고 새 마일스톤 → `_workspace/`를 `_workspace_prev/`로 이동 후 **새 실행**

## Phase 1: 팀 구성

에이전트 팀 모드로 실행한다.

```
TeamCreate(
  team_name: "dobbit-team",
  members: ["planner", "implementer", "verifier"]
)
```

각 에이전트 정의 파일:
- `.Codex/agents/planner.md`
- `.Codex/agents/implementer.md`
- `.Codex/agents/verifier.md`

## Phase 2: 계획 (planner)

planner에게 마일스톤 번호와 현재 상태를 전달한다.

```
SendMessage(
  to: "planner",
  message: """
마일스톤: [사용자 요청에서 파악한 마일스톤명]
현재 상태: [apps/, packages/ 구조 요약]
실행 계획서: /Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/Dobbit 실행 계획서.md
AGENTS.md: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/AGENTS.md
산출물 경로: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/plan.md
"""
)
```

planner로부터 "plan_ready" 수신 후 다음 단계로 진행.

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

implementer로부터 "impl_done" 수신 후 다음 단계로 진행.

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

verifier로부터 "verify_done" 수신 후 결과 수집.

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

## Phase 6: 팀 정리 (에이전트 종료)

종합 보고 완료 후 반드시 팀을 정리한다. 이 Phase를 생략하면 에이전트가 백그라운드에서 계속 실행된다.

### Step 1: 각 에이전트에 종료 요청

```
SendMessage(to: "planner",     type: "shutdown_request", content: "마일스톤 완료, 팀 정리")
SendMessage(to: "implementer", type: "shutdown_request", content: "마일스톤 완료, 팀 정리")
SendMessage(to: "verifier",    type: "shutdown_request", content: "마일스톤 완료, 팀 정리")
```

세 메시지를 동시에(병렬로) 전송한다.

### Step 2: shutdown_approved 수신 확인

각 에이전트로부터 `shutdown_approved` 응답을 기다린다. 3개 모두 수신되면 다음 단계로 진행한다.

### Step 3: TeamDelete

```
TeamDelete()
```

팀 디렉토리(`~/.Codex/teams/dobbit-team/`)와 태스크 디렉토리를 삭제한다.

> 주의: TeamDelete는 활성 멤버가 남아있으면 실패한다. Step 2에서 모든 승인을 확인한 뒤에만 호출한다.

## 에러 핸들링

- **planner 실패**: 실행 계획서 경로 재확인 후 1회 재시도
- **Codex 실패**: impl_result.md에 실패 내용 기록, verifier에게 전달하여 판정
- **검증 실패**: verify_result.md 내용을 사용자에게 보고, 재실행 여부 확인

## 테스트 시나리오

**정상 흐름:**
1. "Milestone 2 진행해줘" → planner가 plan.md 작성 → implementer가 Codex 위임 → verifier가 검증 + Obsidian 기록 → 완료 보고

**에러 흐름:**
1. Codex 빌드 오류 → impl_result.md에 실패 기록 → verifier가 오류 내용 포함하여 Obsidian 기록 → 사용자에게 오류 내용 보고
