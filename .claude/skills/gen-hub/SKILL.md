# gen-hub — _index.md + Linear Issue 생성

`/등록` 커맨드에서 호출되어, Linear Issue를 생성하고 Git에 `docs/issue/{LINEAR-ID}/` 폴더 + `_index.md`를 생성한다.

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
| 1 | **사용자 입력 수집**: `AskUserQuestion`으로 제목, 설명, type 수집. 태그/마일스톤은 AI 추천 후 승인 |
| 2 | **type별 description 구성**: 아래 §type별 description 템플릿에 따라 Linear Issue description 마크다운 조립 |
| 3 | **Linear Issue 생성**: Linear MCP로 Issue 생성 — title, description, labels(type + 태그), project(마일스톤), state: Backlog |
| 4 | **Linear Issue ID 획득**: 응답에서 `PRJ-N` 형식의 ID + URL 추출 |
| 5 | **Git 폴더 생성**: `docs/issue/{LINEAR-ID}/` 디렉토리 생성 |
| 6 | **_index.md 생성**: 아래 §_index.md 템플릿으로 파일 생성. Linear API 응답의 URL을 직접 사용 (수동 URL 조합 금지) |
| 7 | **Linear description에 Git 경로 삽입**: description의 `## Git Documents` 섹션에 `docs/issue/{LINEAR-ID}/_index.md` 경로 기록 |
| 8 | **일괄 등록 처리** (복수 Issue 시): ID 순차 할당 후 2~7단계를 Issue 수만큼 반복. 병렬 생성 가능 |

## Output

| 항목 | 내용 |
|------|------|
| Linear Issue | Backlog 상태의 새 Issue (type Label 부착) |
| Git 파일 | `docs/issue/{LINEAR-ID}/_index.md` |

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
- Index: `docs/issue/{LINEAR-ID}/_index.md`

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
- Index: `docs/issue/{LINEAR-ID}/_index.md`

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
- Index: `docs/issue/{LINEAR-ID}/_index.md`
```

---

## _index.md 템플릿

> docs-writing.md §2 참조. type별 변형(research 등)도 docs-writing.md §2-3 참조.

```markdown
---
linear_id: {LINEAR-ID}
title: {제목}
type: index
issue_type: {feature|bug|improvement|research}
created: {YYYY-MM-DD}
---

> [Linear Issue]({LINEAR-API-응답-URL})

## Documents

| 문서 | 경로 | 상태 |
|------|------|------|
| Plan | — | 미생성 |
| Checklist | — | 미생성 |

## 구현 결과

{feature-close 시 lazy-creation}
```

---

## 현행 대비 주요 변경

| 항목 | 현행 | 신규 |
|------|------|------|
| 파일 경로 | `docs/features/F-NNN.md` | `docs/issue/{LINEAR-ID}/_index.md` |
| ID 체계 | F-NNN (순차 부여) | Linear ID (PRJ-N, Linear가 부여) |
| Issue 등록 | gen-issue 별도 스킬 | gen-hub에 통합 (type: bug) |
| backlogs 갱신 | gen-backlogs 호출 필수 | 제거 — Linear가 인덱스 관리 |
| Hub 크기 | Overview/SC/Decisions/Constraints/KL/Notes/Documents/Status Log | _index.md: linear_id + Documents 테이블 + 구현 결과(lazy) |

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Team/Label 캐시 확인 | `linear_get_teams` | stateId, labelId 사전 조회 (세션 캐시) |
| Issue 생성 | `linear_create_issue` | title, description, labels, project, state 지정 |
| description 갱신 | `linear_update_issue` | Git Documents 경로 삽입 |
