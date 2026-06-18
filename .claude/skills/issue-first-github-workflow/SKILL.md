---
name: issue-first-github-workflow
description: "Dobbit v2 GitHub issue-first workflow. 기능 구현, 버그 수정, 리팩터링, chore 작업 요청 시 issue 생성/확인 → `{type}/{issue_number}-{summary}` branch → 구현/검증 → commit/push → PR → AI review → 타당한 리뷰 반영 → main merge 순서를 따른다."
---

# Issue-First GitHub Workflow

Dobbit v2에서 기능 구현, 버그 수정, 리팩터링, chore 작업을 진행할 때 사용하는 GitHub workflow다.

Claude Code는 이 skill을 통해 작업을 시작할 때 issue를 먼저 확인하고, branch/PR/review/merge 흐름을 일관되게 관리한다.

## Trigger

다음 요청을 받으면 이 skill을 사용한다.

- feature 구현
- bug fix
- refactor
- chore / docs / test / ci 작업
- PR 생성, review 반영, merge 요청
- "이슈 기반으로 진행", "브랜치 생성", "PR 올려줘" 같은 GitHub 작업 요청

단순 읽기/조사만 하는 작업에는 branch나 PR을 만들지 않는다.

## 절대 원칙

1. **issue 먼저**
   - 이미 issue 번호가 주어졌다면 해당 issue를 먼저 읽는다.
   - issue가 없다면 repository issue template에 맞춰 새 issue를 만든다.
   - issue scope가 불명확하면 구현 전에 정리한다.

2. **branch는 issue 번호 기반**
   - 최신 `main`에서 branch를 만든다.
   - branch naming convention:

     ```text
     {type}/{issue_number}-{summary}
     ```

   - 예시:

     ```text
     feat/12-news-cron-job
     fix/16-auth-token-refresh
     chore/24-add-issue-pr-template
     refactor/35-news-design
     ```

3. **Dobbit v2 역할 분리 준수**
   - Claude Code는 설계 검토, 계획 수립, ADR/하네스 문서 수정, 작업 지시, 검증을 담당한다.
   - 소스 코드 변경은 `implementer` agent 또는 Codex 경로로 위임한다.
   - `CLAUDE.md`, `.claude/skills/**/SKILL.md`, `.claude/agents/**` 같은 하네스 문서는 Claude Code가 직접 수정할 수 있다.

4. **AI review는 제안일 뿐이다**
   - Gemini, Copilot 등 AI review 결과를 그대로 적용하지 않는다.
   - 각 리뷰를 타당성 검토 후 반영/보류/미반영으로 분류한다.

## Required Workflow

### 1. Repository 상태 확인

먼저 read-only 확인을 수행한다.

```bash
git status --short --branch
git remote -v
```

확인 사항:

- 작업 tree가 예상한 상태인지
- 원격 저장소가 `Dobbymin/dobbit-v2`인지
- base branch가 `main`인지

작업 tree와 원격 저장소가 예상과 일치하면 최신 `main`으로 이동한다.

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

### 2. Issue 생성 또는 확인

이미 issue 번호가 있으면:

```bash
gh issue view <issue_number>
```

`gh`가 없으면 GitHub REST API 또는 사용 가능한 MCP/GitHub 도구로 issue를 조회한다.

issue가 없으면 `.github/ISSUE_TEMPLATE/issue-template.md` 형식을 따른다.

```markdown
## 이슈 내용(Description)

[작업 목적]

## 상세 내용(Details)

- [구현/수정 범위]
- [완료 기준]
```

### 3. Branch 생성

```bash
git checkout -b {type}/{issue_number}-{summary}
```

허용 type:

```text
feat, fix, chore, refactor, docs, test, ci, perf
```

검증 regex:

```regex
^(feat|fix|chore|refactor|docs|test|ci|perf)/[1-9][0-9]*-[a-z0-9]+(-[a-z0-9]+)*$
```

### 4. 구현/수정

- issue scope에 필요한 변경만 한다.
- 가장 단순하고 충분한 해결책을 선택한다.
- Dobbit v2의 `CLAUDE.md` 역할 분리를 지킨다.
- 소스 코드는 Claude Code가 직접 수정하지 않고 implementer/Codex에 위임한다.
- 하네스 문서(`CLAUDE.md`, `.claude/skills`, `.claude/agents`)는 직접 수정 가능하다.

### 5. 검증

변경 성격에 맞는 검증을 수행한다.

하네스/문서 변경:

```bash
git diff --check
```

branch convention 검증:

```bash
.claude/skills/issue-first-github-workflow/scripts/validate-github-workflow.sh
```

소스 변경이 포함된 경우:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

실행한 명령과 실제 결과를 PR body 또는 작업 로그에 남긴다.

### 6. Commit / Push

```bash
git add <changed-files>
git commit -m "<type>: <summary>"
git push -u origin HEAD
```

commit message는 Dobbit v2 commit convention을 따른다.

### 7. PR 작성

PR은 `.github/pull_request_template.md`를 따른다.

반드시 issue closing keyword를 포함한다.

```text
Closes #<issue_number>
```

PR body에는 다음을 포함한다.

- 요약
- 주요 변경 사항
- 상세 구현 내용
- 트러블 슈팅 / 알려진 이슈
- 검증 결과
- 관련 issue closing keyword

### 8. AI Code Review

가능하면 Gemini, Copilot 등 AI code review를 실행한다.

리뷰 항목별 처리 기준:

| 분류 | 처리 |
|---|---|
| 타당하고 scope 안 | 반영 후 재검증 |
| 타당하지만 scope 밖 | 이유를 남기고 deferred |
| 부정확/불필요 | 이유를 남기고 미반영 |

### 9. Merge

다음을 모두 만족한 뒤 `main`에 merge한다.

- PR이 issue와 연결되어 있다.
- CI/checks가 통과했다.
- AI/human review 의견이 해결되었거나 이유와 함께 정리되었다.
- 사용자가 merge를 요청/승인했다.

기본은 squash merge를 선호한다.

```bash
gh pr merge --squash --delete-branch
```

## Validation Script

이 skill에는 branch/PR body 검증 스크립트가 포함되어 있다.

```text
.claude/skills/issue-first-github-workflow/scripts/validate-github-workflow.sh
```

사용 예:

```bash
BRANCH_NAME='feat/12-news-cron-job' .claude/skills/issue-first-github-workflow/scripts/validate-github-workflow.sh
```

PR body 파일 검증:

```bash
.claude/skills/issue-first-github-workflow/scripts/validate-github-workflow.sh --pr-body pr-body.md
```

## Completion Checklist

- [ ] issue가 존재하고 scope가 명확하다.
- [ ] branch 이름이 `{type}/{issue_number}-{summary}` 형식이다.
- [ ] 최신 `main`에서 branch를 만들었다.
- [ ] 변경 범위가 issue scope를 벗어나지 않는다.
- [ ] 필요한 검증 명령을 실행했다.
- [ ] commit/push를 완료했다.
- [ ] PR body에 `Closes #<issue_number>` 또는 equivalent keyword가 있다.
- [ ] AI review를 실행했거나 실행 불가 이유를 기록했다.
- [ ] review 의견을 타당성 검토 후 반영/보류/미반영으로 정리했다.
- [ ] merge는 review/check 완료 후 사용자의 요청/승인을 받고 진행했다.
