# gen-plan — plan.md + cl.md 생성

dev-pipeline에서 Planning 단계 진입 시 호출되어, `docs/issue/{LINEAR-ID}/plan.md`와 `cl.md`를 동시 생성한다.

## Trigger

- dev-pipeline에서 Planning 단계 진입 시 (feature: Backlog→Planning, improvement: Backlog→Planning)
- Pre-Plan Q/A 완료 후 자동 호출

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, SC), type, labels, relations |
| _index.md | `docs/issue/{LINEAR-ID}/_index.md` — 기존 문서 목록 확인 |
| 코드베이스 조사 결과 | Pre-Plan Q/A Phase 0에서 수집된 관련 파일, 아키텍처 가이드 |
| How 인터뷰 결과 | Pre-Plan Q/A Phase 1에서 확정된 SC, 스펙, Decisions, 리스크, 범위 |

## Process

| 단계 | 행위 |
|------|------|
| 1 | **Linear Issue 정보 읽기**: Linear MCP로 description(Overview, SC), type, relations 조회 |
| 2 | **Related Issue Known Limitations 교차 참조**: Linear relations에서 related/blocked-by Issue 목록 수집 → 해당 Issue의 `docs/issue/{ID}/_index.md`에서 `## 구현 결과` 섹션 읽기 → 설계 이탈, 미해결 이슈 확인 |
| 3 | **plan.md 작성**: 아래 §plan.md 구조에 따라 작성. type에 따라 작성 범위 결정 |
| 4 | **cl.md 작성**: 아래 §cl.md 구조에 따라 작성. Plan의 접근 방식에서 태스크 추출 |
| 5 | **_index.md Documents 테이블 갱신**: Plan, Checklist 행의 경로와 상태를 갱신 |
| 6 | **Linear 상태 전이**: Linear MCP로 State → Planning |
| 7 | **Plan 리뷰 게이트**: feature → `oh-my-claudecode:critic` 에이전트로 구조화 리뷰. improvement → 간략 리뷰 (사용자에게 Plan 요약 제시 + 확인) |

## Output

| 항목 | 내용 |
|------|------|
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` |
| cl.md | `docs/issue/{LINEAR-ID}/cl.md` |
| _index.md | Documents 테이블 갱신 |
| Linear | State → Planning |

---

## plan.md 구조

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

### type별 작성 범위

| type | Plan 작성 범위 |
|------|--------------|
| feature | 목표 + 상세 설계 (1+@ 문서). 200줄 초과 시 분할: `plan-{slug}.md` |
| improvement | 목표 + 접근 방식 + 변경 범위 + 리스크. 간략 설계 |
| bug | plan.md 미생성 — `notes.md`(lazy)에 Root Cause 분석 기록 |
| research | plan.md 미생성 — investigation 스킬이 조사 보고서 직접 생성 |

---

## cl.md 구조

> docs-writing.md §4-3 Nav Link 규칙 참조

```markdown
---
linear_id: {LINEAR-ID}
title: CL: {Issue 제목}
type: checklist
created: {YYYY-MM-DD}
---

> ← [_index.md](./_index.md) | [Linear Issue]({URL}) | [plan.md](plan.md)

## S1. Tasks

| # | ID | Task | Dependencies | Status |
|---|-----|------|-------------|--------|
| 1 | T-{LINEAR-ID}-01 | {태스크 제목} | — | pending |
| 2 | T-{LINEAR-ID}-02 | {태스크 제목} | T-{LINEAR-ID}-01 | pending |

## S2. Done Criteria

> Linear Issue description의 Success Criteria 참조

## S3. Verification

| # | 검증 항목 | 방법 | 기대 결과 |
|---|----------|------|----------|
| 1 | {항목} | {방법} | {결과} |

## S4. Manual Testing Guide

| # | 테스트 항목 | 실행 시나리오 | 기대 결과 |
|---|-----------|-------------|----------|
| 1 | {항목} | {시나리오/명령어} | {결과} |

## Handoff

| 항목 | 내용 |
|------|------|
| 마지막 완료 태스크 | — |
| 다음 태스크 | T-{LINEAR-ID}-01 |
| 비고 | 초기 상태 |
```

### 태스크 ID 형식

`T-{LINEAR-ID}-NN` (예: `T-PRJ-47-01`)

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 용도 |
|------|---------|------|
| Plan 리뷰 (feature) | `oh-my-claudecode:critic` (opus) | 구조화 리뷰 |
| Plan 리뷰 (improvement) | 사용자 직접 확인 | 간략 리뷰 |

---

## 현행 대비 주요 변경

| 항목 | 현행 | 신규 |
|------|------|------|
| 파일 경로 | `docs/plans/PLAN-F-NNN.md`, `CL-F-NNN.md` | `docs/issue/{LINEAR-ID}/plan.md`, `cl.md` |
| SC 참조 | Hub `## Success Criteria` 링크 | Linear Issue description SC 참조 |
| KL 교차 참조 | Hub frontmatter `depends`/`related` → Hub KL 섹션 | Linear relations → 관련 Issue `_index.md` 구현 결과 |
| 태스크 ID | `T-F-NNN-NN` | `T-{LINEAR-ID}-NN` |
| 양방향 링크 | Hub↔Plan↔CL frontmatter 상호 참조 | 동일 폴더 내 상대 경로 참조 |

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Issue 정보 조회 | `get_issue` | description, type, relations 읽기 (단일 Issue) |
| 상태 전이 | `save_issue` (id 지정) | State → Planning |
| Sub-issue 생성 (best-effort) | `save_issue` (parentId 지정) | CL S1 태스크를 Linear Sub-issue로 미러링. 실패 시 진행 중단 안 함 |
