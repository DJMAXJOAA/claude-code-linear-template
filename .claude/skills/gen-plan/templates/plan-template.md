# plan.md 템플릿

> docs-writing.md §3-3 Nav Link 규칙 참조

```markdown
---
linear_id: {LINEAR-ID}
title: "Plan: {Issue 제목}"
type: plan
created: {YYYY-MM-DD}
---

> [Linear Issue]({URL})

## 1. Goal

### What
{무엇을 변경하는가 — 1~2문장}

### Why
{왜 필요한가 — prd.md Overview 요약 참조}

### Done State
{완료 후 시스템 상태 — 검증 가능한 형태}

## 2. Change Scope

{상세 변경 범위 + 영향 모듈}
{요구사항(prd.md) + 설계(technical.md) 확정 후 결정}

## 3. Approach

{technical.md 있으면: 요약 + 참조 링크}
{technical.md 없으면: 변경 내용 직접 기술}
{Approach 하위 항목에 관련 Task ID 인라인 표기: → T-{ID}-01, T-{ID}-02}

## 4. Tasks

> Status: `pending` | `in-progress` | `done` | `blocked` | `skipped`

| # | ID | Task | Dependencies | Status |
|---|-----|------|-------------|--------|
| 1 | T-{LINEAR-ID}-01 | {대상(무엇을) + 방식(어떻게)} | — | pending |
| 2 | T-{LINEAR-ID}-02 | {대상 + 방식} | T-{LINEAR-ID}-01 | pending |

## 5. Requirements Traceability

> prd.md FR 연결 시만 생성. FR-ID 미보유 시 이 섹션 생략.

| FR-ID | 요구사항 요약 | Tasks | Verification |
|-------|-------------|-------|-------------|
| FR-001 | {EARS 1줄 요약} | T-{ID}-01, T-{ID}-03 | V-01, V-02 |

> Traceability 테이블은 **Plan 생성 시점의 스냅샷**. P1 계획수정 시 갱신 대상이 아니다. 태스크 추가/변경 시의 FR 매핑 최신화는 issue-close에서 수행.

## 6. Verification

| # | FR-ID | 검증 항목 | 실행 시나리오 | 기대 결과 |
|---|-------|----------|-------------|----------|
| V-01 | FR-001 | {항목} | {시나리오/명령어} | {결과} |
| V-02 | — | {항목} | {시나리오/명령어} | {결과} |

> FR-ID 규칙: prd.md의 FR-NNN 참조. FR 미연결 시 `—` 기입. 복수 FR 매핑 가능: `FR-001, FR-003`.
> 도메인 spec FR 참조 시: `{spec-name}:FR-NNN`.

## 7. Risks

| 리스크 | 대응 |
|--------|------|
| {리스크 1} | {대응 방안} |

## 8. Outcome

> close 시 추가. 구현 완료 전에는 이 섹션 없음.

| 항목 | 내용 |
|------|------|
| 구현 요약 | {실제 구현 내용} |
| 설계 대비 차이점 | {계획 대비 이탈 사항} |
| 미해결 이슈 | {남은 문제, 없으면 "없음"} |
```

## type별 작성 범위

| type | Plan 작성 범위 |
|------|--------------|
| feature | 목표 + 상세 설계 + 5. Requirements Traceability (prd FR 존재 시) |
| improvement-standard | 목표 + 접근 방식 + 변경 범위 + 리스크 + 5. Requirements Traceability (간략) |
| improvement-light | 인터뷰로 결정 — 생성 시 간략 Goal + Tasks + Verification |
| bug | 인터뷰로 결정 — 생성 시 간략 Goal + Tasks + Verification |

## 태스크 설명 가이드

| 규칙 | 내용 |
|------|------|
| 형식 | "대상(무엇을) + 방식(어떻게)" 포함 |
| 예시 | "gen-hub SKILL.md에서 _index.md 생성 로직을 note.md 초기 생성으로 교체" |
| 금지 | "코드 수정", "구현" 등 모호한 표현 |

## 생명주기

| 단계 | 행동 |
|------|------|
| 구현 중 | **Tasks Status만 갱신** (note.md Work Log와 병행) |
| 동결 | Approach/Verification/Risks는 동결. 변경 시 Linear comment + note.md Work Log에 로그 |
| close 시 | Outcome 추가 + 상단 완료 배너 (`> ✅ 완료`) |

## Mermaid 가이드라인

| 규칙 | 내용 |
|------|------|
| 허용 유형 | flowchart, sequenceDiagram, stateDiagram-v2 |
| 금지 유형 | gantt, pie, mindmap, classDiagram (technical.md에서만 허용) |
| 크기 제한 | 노드 20개 이하, 엣지 30개 이하. 초과 시 분할 |
| 사용 위치 | Approach 섹션 (How 수준) |
