# investigation — 조사 수행 및 보고서 생성

research type Issue의 전체 라이프사이클을 관리한다. 조사 범위 확인 → 수행 → 보고서 작성 → _index.md 갱신 → 사용자 확인 → feature-close 연계.

## Trigger

- dev-pipeline에서 research type, Backlog → In Progress 진입 시
- `/조사` 커맨드에서 호출 시

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, Scope, Deliverables) |
| _index.md | `docs/issue/{LINEAR-ID}/_index.md` — 기존 문서 확인 |

## Process

| 단계 | 행위 |
|------|------|
| 1 | **조사 범위 확인**: Linear Issue description의 Scope/Deliverables 읽기 |
| 2 | **코드베이스/외부 자료 조사**: `oh-my-claudecode:explore`로 코드 탐색 + 필요 시 외부 문서 참조 |
| 3 | **조사 보고서 작성**: `docs/issue/{LINEAR-ID}/RPT-{LINEAR-ID}-{YYYYMMDD}.md` 생성 |
| 4 | **_index.md Documents 테이블 갱신**: 조사 보고서 행 추가 |
| 5 | **사용자에게 결과 요약 + 확인**: `AskUserQuestion`으로 G2 검토 |
| 6 | **feature-close 연계**: 승인 시 feature-close 호출 (Linear Done + 구현 결과 기록) |

## Output

| 항목 | 내용 |
|------|------|
| 조사 보고서 | `docs/issue/{LINEAR-ID}/RPT-{LINEAR-ID}-{YYYYMMDD}.md` |
| _index.md | Documents 테이블에 보고서 행 추가 |
| Linear | State 전이는 feature-close에서 처리 |

---

## 조사 보고서 구조

```markdown
---
linear_id: {LINEAR-ID}
title: 조사 보고서: {주제}
type: report
created: {YYYY-MM-DD}
---

> ← [_index.md](./_index.md)

## 1. 조사 범위

{Linear Issue description의 Scope 요약}

## 2. 조사 결과

{핵심 발견사항 — 테이블/불릿 위주}

## 3. 결론 및 제안

{후속 작업 제안, 의사결정 필요 사항}

## 4. 참조 자료

{참조한 코드 파일, 문서, 외부 자료 목록}
```

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 코드 탐색 | `oh-my-claudecode:explore` | haiku |
| 분석 | `oh-my-claudecode:scientist` | opus |

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Issue 정보 조회 | `get_issue` | description (Scope, Deliverables) 읽기 (단일 Issue) |
| 상태 전이 | `save_issue` (id 지정) | State → In Progress (조사 시작 시) |
