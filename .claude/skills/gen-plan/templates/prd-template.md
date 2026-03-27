# prd.md 템플릿

> docs-writing.md §3-3 Nav Link 규칙 참조

```markdown
---
linear_id: {LINEAR-ID}
title: "PRD: {Issue 제목}"
type: prd
issue_type: {feature/bug/improvement}
created: {YYYY-MM-DD}
---

> [Linear Issue]({URL})

## 1. Overview

{What — 무엇을 변경하는가}
{Why — 왜 필요한가. 배경, 동기, 문제점}

## 2. Scope

{간략 범위. 포함/제외 경계선 — 초기 합의 수준}
{상세 Change Scope는 plan.md에서 확정}

## 3. Functional Requirements

| FR-ID | 패턴 | 요구사항 |
|-------|------|---------|
| FR-001 | {When/While/If/Where/—} | {EARS 형식 요구사항} |

## 4. Non-Functional Requirements

{성능, 보안, 유지보수성 등. 해당 없으면 "해당 없음"}

## 5. Constraints & Dependencies

{기술/성능/호환성 제약}
{선행 의존성. 해당 없으면 "해당 없음"}

## 6. Scope Decisions

| ID | 결정 | 근거 |
|----|------|------|
| SD-01 | {범위 관련 결정} | {근거} |
```

## EARS 패턴 가이드

| 패턴 | 형식 | 용도 |
|------|------|------|
| Event-driven | When {trigger}, the system shall {action} | 특정 이벤트에 의해 트리거되는 동작 |
| State-driven | While {state}, the system shall {action} | 특정 상태가 유지되는 동안의 동작 |
| Unwanted | If {unwanted condition}, the system shall {action} | 예외/에러 상황 대응 |
| Optional | Where {feature is enabled}, the system shall {action} | 선택적 기능 또는 조건부 동작 |
| Ubiquitous | The system shall {action} | 항상 적용되는 무조건적 동작 |

> FR-ID는 이슈 레벨에서 순차 부여 (FR-001, FR-002, ...). 도메인 spec의 FR-NNN과는 별개 네임스페이스.

## 작성 프로세스

| 단계 | 내용 |
|------|------|
| 입력 | Linear description(Summary + SC) + 도메인 spec(연결 시) + 코드 조사 결과 |
| 확정 | 사용자 인터뷰로 각 섹션 확정 |
| References | Linear Documents에서 관리 (prd.md에 별도 섹션 없음. 본문 인라인 참조는 허용) |
| 동결 | 작성 후 동결 (스냅샷). 변경 시 Linear comment + note.md Work Log에 로그 |

## type별 생성 조건

| 경로 | prd.md 생성 |
|------|------------|
| feature | 필수 |
| improvement-standard | 필수 |
| improvement-light | 인터뷰로 결정 |
| bug | 인터뷰로 결정 |
