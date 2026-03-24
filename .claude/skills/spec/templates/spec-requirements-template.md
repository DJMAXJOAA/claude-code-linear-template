# spec `requirements.md` 템플릿

기능적 요구사항 명세. What/Why만 기술하며, How(구현)는 금지한다.

> 공통 규칙: [spec-template.md](./spec-template.md)

## 템플릿

```markdown
---
title: "Requirements: {spec 제목}"
type: spec
parent-spec: {spec-name}
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

> ← [_index.md](./_index.md)

## Functional Requirements

| FR-ID | 패턴 | 요구사항 | 비고 |
|-------|------|---------|------|
| FR-001 | Event-driven | When {trigger}, the system shall {action} | |

## Constraints & Dependencies

| 유형 | 항목 | 설명 |
|------|------|------|
| 기술 제약 | | |
| 외부 의존성 | | |
| 기존 코드 제약 | | |

## Non-Functional Requirements

{해당 시에만. 없으면 섹션 생략}

| 항목 | 기준 | 측정 방법 |
|------|------|----------|

## UI/UX Specifications

{해당 시에만. 없으면 섹션 생략}
```

## 섹션 규칙

| 섹션 | 필수 | 비고 |
|------|:----:|------|
| Functional Requirements | O | EARS 형식 FR 테이블. FR-NNN 체계 (spec-local) |
| Constraints & Dependencies | O | 기술 제약 + 외부 의존성 + 기존 코드 제약 |
| Non-Functional Requirements | △ | 성능, 보안, 호환성 등. 측정 가능한 기준 |
| UI/UX Specifications | △ | 화면 구성, 인터랙션 |

> **Out of Scope는 이 문서에 포함하지 않는다.** Out of Scope는 `_index.md`에만 위치 (SSOT 단일화).

> **금지**: 특정 라이브러리명, 함수명, 구현 패턴 언급. 이는 technical.md 또는 Issue plan.md 영역.
