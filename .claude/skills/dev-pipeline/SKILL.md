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
| 2 (G1) | **Git 문서 확인**: `docs/{type}/{LINEAR-ID}/_index.md` 존재 여부 + Documents 테이블에서 기존 문서 확인 |
| 3 (G1) | **type 판별**: Label에서 type 추출 (`feature` / `bug` / `improvement` / `research`) |
| 4 (G1) | **라우팅 테이블 참조**: 현재 State + type 조합으로 다음 스킬 결정 |
| 5 (G2) | **skip 전이**: type에 `—`인 상태는 자동으로 다음 상태로 건너뜀 (일반 상태 전이는 각 스킬이 수행) |
| 6 (G4) | **스킬 호출**: 결정된 스킬을 호출하며, Linear ID + type + 관련 컨텍스트 전달 |

## Output

| 항목 | 내용 |
|------|------|
| 라우팅 결과 | 현재 상태에 해당하는 스킬 호출 |
| skip 전이 | type에 해당하지 않는 상태 자동 건너뜀 |

> **상태 전이 원칙**: 일반 상태 전이는 각 스킬이 자체 완료 시 수행. dev-pipeline은 skip 전이만 담당.

---

## 라우팅 테이블

### feature

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Backlog | **Pre-Plan Q/A** → gen-plan | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → implement | In Progress |
| In Progress | implement Skill | In Progress (태스크 진행) |
| In Progress (모든 태스크 done) | 수동 테스트 가이드 출력 → `/점검` 대기 | Testing |
| Testing | test Skill | Verifying |
| Verifying | verify Skill 호출 → PASS 시 G2 확인 후 feature-close 자동 호출 | Done |
| Done | 완료 안내 | — |

### bug

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Backlog | Root Cause 분석 시작 | In Progress |
| In Progress | 수정(Fix) 구현 | Verifying |
| Verifying | verify Skill 호출 → PASS 시 G2 확인 후 feature-close 자동 호출 | Done |
| Done | 완료 안내 | — |

### bug 수정 프로세스 (implement 미사용)

bug type은 CL 없이 직접 수정한다. dev-pipeline이 아래 프로세스를 오케스트레이션한다.

| 단계 | 행위 |
|------|------|
| 1 | Root Cause 분석 — 코드베이스 탐색 + `_index.md > ## Notes`에 기록 |
| 2 | 수정 계획 제시 (G1) → 사용자 승인 (G2) |
| 3 | 코드 수정 + 테스트 |
| 4 | 커밋 (`fix: ...`) |
| 5 | Linear State → Verifying |

> 복잡한 버그로 판단될 경우, 사용자 승인 하에 improvement type으로 전환하여 Plan → implement 경로 사용 가능

### improvement

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Backlog | **Pre-Plan Q/A** (간략) → gen-plan | Planning |
| Planning (plan.md 존재) | implement Skill | In Progress |
| In Progress | implement Skill | Verifying |
| Verifying | verify Skill 호출 → PASS 시 G2 확인 후 feature-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> improvement는 Post-Plan Q/A 생략 — Plan이 간략하므로 바로 구현 진입

### research

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Backlog | investigation Skill | In Progress |
| In Progress (보고서 완료) | investigation 완료 반환 → G2 확인 후 feature-close 자동 호출 | Done |
| Done | 완료 안내 | — |

---

## Pre-Plan Q/A (feature / improvement 공통)

feature의 Backlog 상태에서 gen-plan 호출 전, 설계 결정 확인 + 코드베이스 조사를 수행하는 인터랙션.
improvement는 간략 버전으로 수행한다.

| 단계 | 행위 |
|------|------|
| 1 | **컨텍스트 수집**: Linear MCP로 related issue 조회 + Label 기반 관련 Issue 필터링. `oh-my-claudecode:explore` 에이전트로 코드베이스 조사 위임 |
| 2 | **간략 조사**: 관련 파일 탐색 (구현 대상, 의존 모듈), 아키텍처 가이드 참조. improvement는 핵심 파일만 확인 |
| 3 | **How 인터뷰**: `AskUserQuestion`으로 각 항목 확인. feature는 5항목(SC, 스펙, Decisions, 리스크, 범위). improvement는 3항목(SC, 접근방식, 범위)으로 축소 |
| 4 | **SC를 Linear description에 기록**: 확정된 SC를 Linear Issue description의 `## Success Criteria` 섹션에 삽입 |

> §10 인터뷰 원칙 적용 (pipeline.md 참조)

## Post-Plan Q/A (feature 전용)

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
| feature | Pre-Plan Q/A 코드 조사 | `oh-my-claudecode:explore` (haiku) |
| feature | Post-Plan Q/A AI 리뷰 | `oh-my-claudecode:critic` (opus) |
| feature | 설계 단계 | opus |
| feature | 구현 단계 | sonnet (executor) |
| bug | 분석+수정 | sonnet |
| improvement | 설계+구현 | sonnet |
| research | 분석 | opus |

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| 상태 조회 | `get_issue` | Issue의 현재 State + type(Label) + assignee 조회 (단일 Issue) |
| 관련 Issue 조회 | `list_issues` (Label 필터) | Pre-Plan Q/A 컨텍스트 수집 (다수 검색) |
