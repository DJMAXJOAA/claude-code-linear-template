---
name: investigation
description: "Issue 또는 주제에 대한 조사를 수행하고 보고서를 생성. 모든 type의 Issue에서 호출 가능."
---

# investigation — 조사 수행 및 보고서 생성

Issue 또는 주제에 대한 조사를 수행한다. 모든 type의 Issue에서 호출 가능하다. 조사 범위 확인 → 수행 → 보고서 작성 → Linear Documents 갱신 → 사용자 확인 → 완료 결과 반환.

## Trigger

- `/조사` 커맨드에서 호출 시

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, Scope, Deliverables) |
| note.md | `docs/issue/{LINEAR-ID}/note.md` — 기존 문서 확인 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **조사 범위 확인**: Linear Issue description의 Scope/Deliverables 읽기 |
| 2 (G1) | **코드베이스/외부 자료 조사**: `oh-my-claudecode:explore`로 코드 탐색 + 필요 시 외부 문서 참조. 심층 분석이 필요하면 `oh-my-claudecode:scientist`에 분석 위임 |
| 3 (G1) | **조사 보고서 작성**: `docs/issue/{LINEAR-ID}/RPT-{LINEAR-ID}-{YYYYMMDD}.md` 생성 |
| 4 (G2) | **사용자에게 결과 요약 + 확인**: `AskUserQuestion`으로 검토 |
| 5 (G3) | **Git 커밋 + Linear 갱신**: 조사 보고서 Git 커밋 + Linear description Documents 섹션에 보고서 경로 추가 |
| 6 (G4) | **완료 결과를 반환**: 승인 시 완료 결과를 반환. dev-pipeline이 issue-close 결정 |

## Output

| 항목 | 내용 |
|------|------|
| 조사 보고서 | `docs/issue/{LINEAR-ID}/RPT-{LINEAR-ID}-{YYYYMMDD}.md` |
| Linear Documents | description Documents 섹션에 보고서 경로 추가 |
| Linear | State 전이는 issue-close에서 처리 |

---

## 조사 보고서 구조

> 조사 보고서 템플릿: [templates/report-template.md](templates/report-template.md)

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 코드 탐색 | `oh-my-claudecode:explore` | haiku |
| 심층 분석 | `oh-my-claudecode:scientist` | opus — 조사 범위가 넓거나 기술적 판단이 필요할 때 호출. Process 2 단계에서 explore 결과를 전달하여 분석 수행 |
| 인과 추적 (선택) | `oh-my-claudecode:tracer` | sonnet — 인과관계 규명이 핵심인 조사에서 경쟁 가설 기반 증거 추적 |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## 보고서 참조 규칙

| 규칙 | 내용 |
|------|------|
| 보고서 대상 | 조사 보고서 (태스크별 L2 보고서는 Linear comment로 대체) |
| 보고서 경로 | `docs/issue/{LINEAR-ID}/RPT-*.md` |
| 보고서 frontmatter | `linear_id`, `title`, `type: report`, `created` |
| 보고서 링킹 | 보고서 → `> [Linear Issue]({URL})` Nav Link 필수 |
| 보고서 불변 원칙 | 완료된 보고서는 수정 금지 — 새 보고서로 대체 |

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description(Scope, Deliverables) 조회 | 조사 범위 확인 시 1회 |
| State → In Progress 전이 | 조사 시작 시 |

---

## 관련 스킬

| 스킬 | 관계 |
|------|------|
| `oh-my-claudecode:deep-dive` | trace → deep-interview 2단계 파이프라인. 인과 조사 후 요구사항 결정화가 필요한 복잡한 조사에서 활용 가능 (v4.9.0+) |
