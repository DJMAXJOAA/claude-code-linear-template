# gen-hub — _index.md + Linear Issue 생성

`/등록` 커맨드에서 호출되어, Linear Issue를 생성하고 Git에 `docs/{type}/{LINEAR-ID}/` 폴더 + `_index.md`를 생성한다.

## Trigger

- `/등록` 커맨드 호출 시
- 사용자가 직접 Issue 등록을 요청할 때

## Input

| 항목 | 설명 |
|------|------|
| 제목 | Issue 제목 |
| 설명 | What + Why (1~3문장) |
| type | `feature` / `bug` / `improvement` / `research` — 사용자 지정 또는 AI 추천 |
| 태그 | Linear Label로 등록할 태그 목록. AI가 컨텍스트 기반 추천 → 사용자 승인 |
| 마일스톤 | Linear Project에 매핑할 마일스톤 (선택) |
| Priority | High / Medium / Low (선택, 기본값: Medium) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **사용자 입력 수집**: `AskUserQuestion`으로 제목, 설명, type 수집. 태그/마일스톤은 AI 추천 후 승인 |
| 2 (G2) | **type별 description 구성 + 사용자 승인**: 아래 §type별 description 템플릿에 따라 Linear Issue description 마크다운 조립 → `AskUserQuestion`으로 내용 확인 |
| 3 (G3) | **Linear Issue 생성**: Linear MCP로 Issue 생성 — title, description, labels(type + 태그), project(마일스톤), state: Backlog |
| 4 (G3) | **Linear Issue ID 획득**: 응답에서 `PRJ-N` 형식의 ID + URL 추출 |
| 5 (G3) | **Git 폴더 생성**: `docs/{type}/{LINEAR-ID}/` 디렉토리 생성 |
| 6 (G3) | **_index.md 생성**: 아래 §_index.md 템플릿으로 파일 생성. Linear API 응답의 URL을 직접 사용 (수동 URL 조합 금지) |
| 7 (G3) | **Linear description에 Git 경로 삽입**: description의 `## Git Documents` 섹션에 `docs/{type}/{LINEAR-ID}/_index.md` 경로 기록 |

## Output

| 항목 | 내용 |
|------|------|
| Linear Issue | Backlog 상태의 새 Issue (type Label 부착) |
| Git 파일 | `docs/{type}/{LINEAR-ID}/_index.md` |

---

## type별 description 템플릿

### feature / improvement 공통

```markdown
## Overview
| 항목 | 내용 |
|------|------|
| What | {한 줄 설명} |
| Why | {필요성} |
| Priority | {High/Medium/Low} |

## Success Criteria
{Pre-Plan Q/A에서 확정 — 등록 시점에는 비워둠}

## Git Documents
- Index: `docs/{type}/{LINEAR-ID}/_index.md`

## Source References
{관련 소스 파일 경로 — 등록 시점에는 비워둠}
```

### bug

```markdown
## Overview
| 항목 | 내용 |
|------|------|
| What | {버그 증상 한 줄} |
| Reproduction | {재현 절차 요약} |
| Priority | {High/Medium/Low} |

## Acceptance Criteria
1. {수정 후 기대 동작}

## Git Documents
- Index: `docs/bug/{LINEAR-ID}/_index.md`

## Source References
{관련 소스 파일 경로}
```

### research

```markdown
## Overview
| 항목 | 내용 |
|------|------|
| What | {조사 주제} |
| Why | {조사 필요성} |
| Scope | {조사 범위} |

## Deliverables
1. {산출물 목록}

## Git Documents
- Index: `docs/research/{LINEAR-ID}/_index.md`
```

---

## _index.md 템플릿

> docs-writing.md §2 참조. type별 변형(research 등)도 docs-writing.md §2-3 참조.

### feature / improvement 공통

```markdown
---
linear_id: {LINEAR-ID}
title: {제목}
type: index
issue_type: {feature|improvement}
created: {YYYY-MM-DD}
---

> [Linear Issue]({LINEAR-API-응답-URL})

## Documents

| 문서 | 경로 | 상태 |
|------|------|------|
| Plan | — | 미생성 |
| Checklist | — | 미생성 |

## Decisions

## Notes

## Task Log

## 구현 결과

{feature-close 시 lazy-creation}
```

### bug

```markdown
---
linear_id: {LINEAR-ID}
title: {제목}
type: index
issue_type: bug
created: {YYYY-MM-DD}
---

> [Linear Issue]({LINEAR-API-응답-URL})

## Documents

| 문서 | 경로 | 상태 |
|------|------|------|

## Notes

### Root Cause

{수정 완료 후 기록}

## 구현 결과

{feature-close 시 lazy-creation}
```

### research

```markdown
---
linear_id: {LINEAR-ID}
title: {제목}
type: index
issue_type: research
created: {YYYY-MM-DD}
---

> [Linear Issue]({LINEAR-API-응답-URL})

## Documents

| 문서 | 경로 | 상태 |
|------|------|------|
| 조사 보고서 | — | 미생성 |

## Notes

## 구현 결과

{feature-close 시 lazy-creation}
```

> research type은 설계 결정이 없으므로 `## Decisions` 섹션 불필요.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Team/Label 캐시 확인 | `list_teams` | stateId, labelId 사전 조회 (세션 캐시) |
| Issue 생성 | `save_issue` (id 미지정) | title, description, labels, project, state 지정 |
| description 갱신 | `save_issue` (id 지정) | Git Documents 경로 삽입 |
