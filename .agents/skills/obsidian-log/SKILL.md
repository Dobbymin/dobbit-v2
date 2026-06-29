---
name: obsidian-log
description:
  "Dobbit v2 Obsidian 작업 로그 작성 스킬. 구현 완료, 검증 완료, 마일스톤 진행
  후 자동으로 Obsidian에 기록이 필요할 때 사용한다. verifier 에이전트가 검증
  완료 후 반드시 트리거한다."
---

# Obsidian Log

Dobbit v2 개발 과정을 Obsidian 작업 로그에 기록한다.

## 로그 경로

```
/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/작업로그/YYYY-MM-DD.md
```

같은 날짜 파일이 이미 있으면 **덧붙인다** (덮어쓰지 않는다).

## 로그 템플릿

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
milestone: [N - 마일스톤명]
---

# YYYY-MM-DD 작업 로그

## 목표

[이번 작업의 목표 한 줄]

## 완료 기준

- [x] 완료된 항목
- [ ] 미완료 항목 (이유)

## 작업 내용

### [작업명]

[수행한 내용, 실행한 명령어, 결과]

**AI 협업 메모:**

- Codex: [계획/지시 내용 요약]
- Codex: [구현한 내용 요약]

## 검증 결과

- 타입 체크: 통과 / 오류 N개
- 린트: 통과 / 경고 N개

## 다음 작업

[다음 마일스톤 또는 작업 목록]

## 참고

- [관련 ADR 링크]
- [설계 문서 링크]
```

## 작성 원칙

- "문제 → 판단 → 구현 → 검증 → 배운 점" 흐름으로 작성한다
- 단순 진행 일지가 아니라 나중에 포트폴리오 근거가 될 수 있게 작성한다
- AI가 제안한 내용을 그대로 쓴 경우 vs 수정한 경우를 구분하여 기록한다
- 실패한 시도도 빠짐없이 기록한다
