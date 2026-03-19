# dev-pipeline — 통합 파이프라인 라우터

Linear Issue의 현재 상태(State)와 type(Label)을 조회하여, 해당 단계에 적합한 스킬로 라우팅하는 **상태 기반 라우터**.

## Trigger

- `/활성화 {LINEAR-ID}` 커맨드 호출 시
- 사용자가 특정 Issue의 파이프라인 다음 단계 진행을 요청할 때

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — Linear Issue 식별자 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **Linear 상태 조회**: Linear MCP로 Issue의 현재 State + type(Label) + assignee 조회 |
| 2 (G1) | **Git 문서 확인**: `docs/issue/{LINEAR-ID}/_index.md` 존재 여부 + Documents 테이블에서 기존 문서 확인 |
| 3 (G1) | **type 판별**: Label에서 type 추출 (`feature`/`improvement` → 통합 처리, `bug` → 별도) |
| 4 (G1) | **라우팅 테이블 참조**: 현재 State + type 조합으로 다음 스킬 결정 |
| 5 (G2) | **skip 전이**: type에 `—`인 상태는 자동으로 다음 상태로 건너뜀 (일반 상태 전이는 각 스킬이 수행) |
| 5a (G1) | **bug Git 문서 스킵**: bug type은 `docs/issue/{LINEAR-ID}/` 존재 여부 확인을 스킵 |
| 6 (G4) | **스킬 호출**: 결정된 스킬을 호출하며, Linear ID + type + 관련 컨텍스트 전달 |

## Output

| 항목 | 내용 |
|------|------|
| 라우팅 결과 | 현재 상태에 해당하는 스킬 호출 |
| skip 전이 | type에 해당하지 않는 상태 자동 건너뜀 |

> **상태 전이 원칙**: 일반 상태 전이는 각 스킬이 자체 완료 시 수행. dev-pipeline은 skip 전이만 담당.

---

## 라우팅 테이블

> type별 라우팅 상세 + bug 수정 프로세스: [routing-tables.md](routing-tables.md)

---

## Pre-Plan Q/A (feature / improvement 공통)

Todo 상태에서 gen-plan 호출 전, 설계 결정 확인 + 코드베이스 조사를 수행하는 인터랙션.
improvement는 간략 버전으로 수행한다.

| 단계 | 행위 |
|------|------|
| 0 | **Linear 상태 갱신**: Linear MCP로 State → Planning 즉시 전이. Pre-Plan Q/A 시작을 Linear에 선반영 |
| 1 | **컨텍스트 수집**: Linear MCP로 related issue 조회 + Label 기반 관련 Issue 필터링 |
| 2 | **스코프/조사 인터뷰**: `AskUserQuestion`으로 (a) explore 탐색 범위(전체/특정 모듈/최소) (b) `/조사`(investigation) 실행 여부를 확인 |
| 3 | **코드베이스 조사**: 인터뷰 결과에 따라 `oh-my-claudecode:explore` 에이전트로 코드베이스 조사 위임. improvement는 핵심 파일만 확인. 조사 선택 시 investigation 스킬 호출 |
| 4 | **How 인터뷰**: `AskUserQuestion`으로 각 항목 확인. feature는 5항목(SC, 스펙, Decisions, 리스크, 범위). improvement는 3항목(SC, 접근방식, 범위)으로 축소 |
| 5 | **SC를 Linear description에 기록**: 확정된 SC를 Linear Issue description의 `## Success Criteria` 섹션에 삽입 |

> §10 인터뷰 원칙 적용 (pipeline.md 참조)

## Post-Plan Q/A (feature / improvement 공통)

Planning 상태에서 plan.md + cl.md 존재 확인 후, 다음 행동을 사용자에게 선택받는 인터랙션.

| 단계 | 행위 |
|------|------|
| 1 | Plan+CL 핵심 요약 제시 |
| 2 | `AskUserQuestion`으로 사용자 선택: **(a)** 바로 구현 (AI 권장) **(b)** Plan Q&A 인터뷰 **(c)** AI 리뷰 (`oh-my-claudecode:critic`) |
| 3a | 바로 구현: Linear State → In Progress → implement Skill 호출 |
| 3b | Q&A 인터뷰: Plan 내용 질의응답 → 완료 후 다시 선택(2단계) |
| 3c | AI 리뷰: `oh-my-claudecode:critic` 에이전트로 리뷰 → 결과 제시 후 다시 선택(2단계) |

---

## OMC 에이전트 연동

| type | 단계 | 에이전트 |
|------|------|---------|
| feature/improvement | Pre-Plan Q/A 코드 조사 | `oh-my-claudecode:explore` (haiku) |
| feature/improvement | Post-Plan Q/A AI 리뷰 | `oh-my-claudecode:critic` (opus) |
| feature/improvement | 설계 단계 | opus |
| feature/improvement | 구현 단계 | sonnet (executor) |
| bug | 탐색 | `oh-my-claudecode:explore` (haiku) |
| bug | Root Cause 분석 | `oh-my-claudecode:debugger` (sonnet) |
| bug | 코드 수정 | `oh-my-claudecode:executor` (sonnet) |

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| 상태 조회 | `get_issue` | Issue의 현재 State + type(Label) + assignee 조회 (단일 Issue) |
| Pre-Plan 상태 전이 | `save_issue` (id 지정) | State → Planning (Pre-Plan Q/A 시작 전 즉시) |
| 관련 Issue 조회 | `list_issues` (Label 필터) | Pre-Plan Q/A 컨텍스트 수집 (다수 검색) |
