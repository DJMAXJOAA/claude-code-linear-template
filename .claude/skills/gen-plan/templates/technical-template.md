# technical.md 템플릿

> docs-writing.md §3-3 Nav Link 규칙 참조

```markdown
---
linear_id: {LINEAR-ID}
title: "Technical: {Issue 제목}"
type: technical
created: {YYYY-MM-DD}
---

> [Linear Issue]({URL})

## 1. Context

{현재 코드/시스템 상태}
{기술적 제약}
{고려한 대안 + 기각 사유}

## 2. Architecture

{컴포넌트 관계 — Mermaid flowchart 또는 classDiagram}

## 3. Key Flows

{정상 흐름 — Mermaid sequenceDiagram}
{에러/폴백 흐름 — Mermaid sequenceDiagram}

## 4. Interface Contracts

{공개 API 시그니처}
{입출력 타입, 호출 규약}

## 5. Design Decisions

| ID | 결정 | 근거 |
|----|------|------|
| DD-01 | {설계 관련 결정} | {근거} |
```

## Mermaid 가이드라인

| 다이어그램 | 허용 위치 |
|-----------|----------|
| `sequenceDiagram` | prd(이슈), spec(도메인), technical, plan |
| `flowchart` | prd(이슈), spec(도메인), technical, plan |
| `classDiagram` | technical만 |
| `erDiagram` | technical만 |
| `stateDiagram` | prd(이슈), spec(도메인), technical |

> technical.md에서는 클래스명/모듈명을 직접 사용할 수 있다.
> prd.md/spec에서는 역할명(Role-based) 사용.

## 작성 프로세스

| 단계 | 내용 |
|------|------|
| 입력 | prd.md + SC |
| 조사 | Context에 코드베이스 조사(investigation) 결과를 흡수 |
| 확정 | 사용자 인터뷰로 설계 방향 확정 |
| Mermaid | Architecture 최소 1개, Key Flows 최소 1개 |
| What/Why | "prd.md 참조"로 위임. 복제하지 않는다 |
| 동결 | 작성 후 동결 (스냅샷). 변경 시 Linear comment + note.md Work Log에 로그 |

## 생성 판별

prd.md 작성 후 gen-plan이 수행:

| 조건 | 행동 |
|------|------|
| 3+ 컴포넌트 상호작용 | 생성 권장 → `AskUserQuestion` |
| 새 인터페이스/추상화 도입 | 생성 권장 → `AskUserQuestion` |
| 기존 구조 재설계 | 생성 권장 → `AskUserQuestion` |
| 해당 없음 | 스킵 — plan.md Approach에 직접 기술 |

## type별 생성 조건

| 경로 | technical.md 생성 |
|------|------------------|
| feature | 선택 (복잡도 기반) |
| improvement-standard | 선택 (복잡도 기반) |
| improvement-light | 생성 안 함 |
| bug | 생성 안 함 |
