# spec `roadmap.md` 템플릿 (선택)

Feature를 Issue로 분할하는 전략 문서. **2개 이상 Issue로 분할이 예상되는 기능에만 생성**한다. 단일 Issue로 충분한 기능이면 이 문서를 생성하지 않는다.

> 공통 규칙: [spec-template.md](./spec-template.md)

> **roadmap.md ≠ Issue plan.md**: roadmap = "어떤 Issue들로 나눌까" (기능 수준), Issue plan = "해당 Issue를 어떻게 구현할까" (구현 수준). 혼동 주의.

## 템플릿

```markdown
---
title: "Roadmap: {spec 제목}"
type: spec
parent-spec: {spec-name}
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

> ← [overview.md](./overview.md)

## Issue 분할 전략

{기능을 어떤 기준으로 Issue들로 나누는지. 1~2문장}

| Issue | 설명 | 관련 FR |
|-------|------|--------|
| {Issue 제목} | {한 줄 설명} | FR-001, FR-002 |

## 작업 의존성

{Issue 간 의존 관계. Mermaid flowchart 또는 테이블}

## 구현 순서

1. {Phase 1}: {무엇을 먼저, 왜}
2. {Phase 2}: {다음, 왜}

## 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
```

> **상세도 기준**: "어떤 Issue들이 필요하고, 어떤 순서가 좋은지"를 전달할 수 있으면 충분. 각 Issue의 태스크 분해/상세 계획은 해당 Issue plan.md에서 확정.

## 섹션 규칙

| 섹션 | 필수 | 비고 |
|------|:----:|------|
| Issue 분할 전략 | O | 분할 기준 + Issue 목록 테이블 |
| 작업 의존성 | O | Issue 간 의존 관계 |
| 구현 순서 | O | Phase별 순서 + 이유 |
| 리스크 | △ | 리스크/영향/대응 테이블 |

## 마이그레이션 규칙

> 상세: [spec SKILL.md](../SKILL.md) 마이그레이션 규칙 참조
