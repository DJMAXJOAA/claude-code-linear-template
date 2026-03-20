# plan.md 템플릿

> docs-writing.md §4-3 Nav Link 규칙 참조

```markdown
---
linear_id: {LINEAR-ID}
title: Plan: {Issue 제목}
type: plan
created: {YYYY-MM-DD}
---

> ← [_index.md](./_index.md) | [Linear Issue]({URL})

## 1. Goal

{설계 목표 — How 관점. Linear description의 What/Why와 중복하지 않음}

## 2. Approach

{접근 방식, 설계 결정, 아키텍처 변경}
{feature: 상세 설계. improvement: 간략 설계}

## 3. Tasks

태스크 {N}개. 상세 목록/의존성/진행 상태: [cl.md](cl.md) S1

핵심 구현 순서:
1. {태스크 그룹 1 요약}
2. {태스크 그룹 2 요약}

## 4. Verification

> [cl.md](cl.md) S2/S3 참조

## 5. Risks & Notes

{리스크, 엣지케이스, 교차 참조된 Known Limitations 반영}
```

## type별 작성 범위

| type | Plan 작성 범위 |
|------|--------------|
| feature | 목표 + 상세 설계 (단일 plan.md) |
| improvement | 목표 + 접근 방식 + 변경 범위 + 리스크. 간략 설계 |
| bug | plan.md 미생성 — `_index.md > ## Notes`에 Root Cause 분석 기록 |
