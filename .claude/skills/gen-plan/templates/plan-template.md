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

## 3a. Requirements Traceability

> Spec FR → Task/Verification 매핑. Spec 미존재 또는 FR-ID 미보유 시 이 섹션 생략.

| FR-ID | 요구사항 요약 | Tasks | Verification |
|-------|-------------|-------|-------------|
| FR-001 | {EARS 1줄 요약} | T-{ID}-01, T-{ID}-03 | S3 #1, #2 |
| FR-002 | {EARS 1줄 요약} | T-{ID}-02 | S3 #3 |

> Traceability 테이블은 **Plan 생성 시점의 스냅샷**. P1 계획수정(pipeline.md §3 참조) 시 갱신 대상이 아니다. 태스크 추가/변경 시의 FR 매핑 최신화는 feature-close §7의 spec 연동 갱신에서 수행.

## 4. Verification

> [cl.md](cl.md) S2/S3 참조

## 5. Risks & Notes

{리스크, 엣지케이스, 교차 참조된 Known Limitations 반영}
```

## type별 작성 범위

| type | Plan 작성 범위 |
|------|--------------|
| feature | 목표 + 상세 설계 (단일 plan.md) + 3a. Requirements Traceability (Spec + FR-ID 존재 시) |
| improvement | 목표 + 접근 방식 + 변경 범위 + 리스크. 간략 설계 + 3a. Requirements Traceability (Spec + FR-ID 존재 시, 간략) |
| bug | plan.md 미생성 — `_index.md > ## Notes`에 Root Cause 분석 기록 |

## Mermaid 가이드라인

| 규칙 | 내용 |
|------|------|
| 허용 유형 | flowchart, sequenceDiagram, stateDiagram-v2, erDiagram |
| 금지 유형 | gantt, pie, mindmap, classDiagram |
| 크기 제한 | 노드 20개 이하, 엣지 30개 이하. 초과 시 분할 |
| 사용 위치 | Approach 섹션 (How 수준). _index.md/cl.md 금지 |
