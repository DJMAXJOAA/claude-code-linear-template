---
name: dev-pipeline
description: "Linear Issue 상태(State)와 type(Label)을 조회하여 적합한 스킬로 라우팅하는 통합 파이프라인 라우터."
disable-model-invocation: true
---

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
| 1a (G1) | **Sub-issue 상태 확인**: Linear MCP로 현재 Issue의 child sub-issue 전체 조회. 미완료 항목 존재 시 §Sub-issue 리마인딩 수행 |
| 2 (G1) | **Git 문서 확인**: `docs/issue/{LINEAR-ID}/_index.md` 존재 여부 + Documents 테이블에서 기존 문서 확인 |
| 3 (G1) | **type 판별**: Label에서 type 추출 (`feature` → feature 경로, `improvement` → size 판별 후 improvement-fix, `bug` → bug-fix) |
| 3a (G1) | **improvement size 판별** (improvement만): §improvement size 판별 참조. `/활성화` 재개 시 description Overview `Size` 행에서 기존 값 확인 → 있으면 판별 스킵 |
| 4 (G1) | **라우팅 테이블 참조**: 현재 State + type + size 조합으로 다음 스킬 결정 |
| 5 (G2) | **skip 전이**: type에 `—`인 상태는 자동으로 다음 상태로 건너뜀 (일반 상태 전이는 각 스킬이 수행) |
| 5a (G1) | **bug/improvement-light Git 문서 스킵**: bug type 및 improvement light는 `docs/issue/{LINEAR-ID}/` 존재 여부 확인을 스킵 |
| 6 (G4) | **스킬 호출**: 결정된 스킬을 호출하며, Linear ID + type + size + 관련 컨텍스트 전달 |

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

## improvement size 판별 (dev-pipeline 담당)

**시점**: `/활성화` → dev-pipeline Todo 단계, improvement type 감지 시.

| 단계 | 행위 |
|------|------|
| 1 | **재개 확인**: Linear description Overview `Size` 행 확인. 값이 있으면 (`light`/`standard`) 판별 스킵 → 기존 경로 자동 진행 |
| 2 | **AI 추천**: Linear description + title 분석하여 size 추천. light 조건(L1~L3 모두 충족 시): (L1) 새 클래스/인터페이스 생성 없음, (L2) 기존 로직 변경 없음(rename, 경로 이동, 패턴 일괄 적용, 코드 정리), (L3) 영향 범위가 명확(사이드이펙트 판단 불필요 또는 자명) |
| 3 | **`AskUserQuestion` 1회**: size 선택 — `light` (AI 추천 시 표시) / `standard` / 모르겠으면 standard |
| 4 | **Linear description 갱신**: Overview 테이블에 `Size` 행 추가 (`light` 또는 `standard`) |
| 5 | **improvement-fix 스킬 호출**: size 인자 전달 |

---

## P1 계획수정 오케스트레이션 (dev-pipeline 담당)

**진입**: triage G4 반환값에서 P1 판정을 수신하여 오케스트레이션 시작.
(dev-pipeline은 `/점검` 호출의 상위 오케스트레이터이므로 triage 반환값을 직접 수신)

dev-pipeline이 다음을 순서대로 수행:
1. plan.md 수정 (Goal/Approach/Tasks 갱신) — `oh-my-claudecode:executor` (sonnet)
2. cl.md S1 갱신 (태스크 리셋/추가, S3 검증항목 갱신) — 동일 executor
3. docs: 커밋 (plan/cl 수정분)
4. implement Skill 재호출 (수정된 CL S1 기준으로 재개)
5. implement 완료 후 verify 자동 재실행
5a. **verify FAIL 시**: L3로 자동 에스컬레이션 — sub-issue 생성 후 블로킹 라이프사이클 진입.
    P1 자체수정 1회 시도 후 verify 통과 실패는 변경 범위가 P1 한계를 초과했음을 의미.

---

## Pre-Plan Q/A (feature 전용)

Todo 상태에서 gen-plan 호출 전, **요구사항 확인 + 설계 결정**을 2개 Phase로 분리하여 수행하는 인터랙션.

### Phase 1: 요구사항 확인 (What / Why)

환류·탐색 결과를 기반으로 요구사항을 비교·보완하고 SC를 확정한다.

| 단계 | 행위 |
|------|------|
| 0 | **Linear 상태 갱신**: Linear MCP로 State → Planning 즉시 전이. Pre-Plan Q/A 시작을 Linear에 선반영 |
| 1 | **컨텍스트 수집**: Linear MCP로 related issue 조회 + Label 기반 관련 Issue 필터링 |
| 1a | **관련 문서 환류**: related issue의 `_index.md`(Decisions, Notes) + `plan.md` 읽기 (최대 5개). 요약하여 step 2에서 제시. 구현 결과 섹션은 gen-plan에서 별도 참조 |
| 2 | **스코프/조사 인터뷰**: step 1a 환류 결과를 요약 제시한 뒤, `AskUserQuestion`으로 (a) explore 탐색 범위(전체/특정 모듈/최소) (b) `/조사`(investigation) 실행 여부를 확인 |
| 3 | **코드베이스 조사**: 인터뷰 결과에 따라 `oh-my-claudecode:explore` 에이전트로 코드베이스 조사 위임. 조사 선택 시 investigation 스킬 호출 |
| 3a | **탐색 결과 + 요구사항 비교**: step 3 조사 결과 + step 1a 환류 결과를 종합하여 요약 제시. Linear description의 기존 요구사항과 비교하여 **차이·누락·애매한 부분**을 What/Why 관점에서 식별 |
| 3b | **요구사항 보완 인터뷰** (필요 시): 3a에서 애매한 부분이 발견되면 `AskUserQuestion`으로 What/Why 관점 질문 (예: 범위 명확화, 누락 요구사항 확인, 목적 재확인). 발견 없으면 스킵 |
| 3c | **SC 확정**: `AskUserQuestion`으로 SC 확정. 기존 SC(Linear description) + 탐색 결과 + 보완된 요구사항을 반영한 SC 권장안을 AI가 제안하고 사용자가 확인/수정 |
| 3d | **SC Linear 기록**: 확정된 SC를 Linear Issue description의 `## Success Criteria` 섹션에 삽입 |

### Phase 2: 설계 결정 (How)

Phase 1에서 확정된 요구사항·SC를 기반으로, 설계 항목별 순차 인터뷰를 통해 사용자가 직접 설계를 결정한다.

| 단계 | 행위 |
|------|------|
| 4 | **설계 항목 도출**: 확정된 요구사항 + 탐색 결과에서 결정이 필요한 설계 항목 목록을 도출. 의존 관계 순으로 정렬하여 제시. 자명한 결정(선택지가 1개이거나 관례상 정해진 것)은 제외 |
| 4a~N | **항목별 순차 인터뷰**: 각 설계 항목에 대해 `AskUserQuestion` 1회씩 수행. 항목당 포함 내용: **(a)** 배경 설명 — 왜 이 결정이 필요한지, 영향 범위 **(b)** 선택지 2~3개 — 각각 장단점 명시 **(c)** AI 권장안 — `(AI 권장)` 라벨 + 권장 이유. 앞선 결정이 이후 항목에 영향을 주면 선택지를 조정하여 반영 |
| 5 | **_index.md 갱신**: `## Decisions`에 Phase 2 설계 결정 기록, `## Notes`에 Phase 1 조사 결과 요약 + 스코프 범위 기록. gen-plan 호출 전 수집 정보를 Git에 선저장 |

> §11 인터뷰 원칙 적용 (pipeline.md 참조)
> improvement는 Pre-Plan Q/A를 사용하지 않는다. improvement-fix 스킬이 자체 Pre-Plan 인터뷰(standard: 4항목)를 수행.

## Post-Plan Q/A (feature / improvement-standard 공통)

Planning 상태에서 plan.md + cl.md 존재 확인 후, 다음 행동을 사용자에게 선택받는 인터랙션.

| 단계 | 행위 |
|------|------|
| 1 | Plan+CL 핵심 요약 제시 |
| 2 | `AskUserQuestion`으로 사용자 선택: **(a)** 바로 구현 **(b)** Plan Q&A 인터뷰 **(c)** 합의 리뷰 (Architect + Critic) |
| 3a | 바로 구현: plan.md + cl.md + _index.md가 미커밋 상태이면 Git 커밋 수행 → Linear State → In Progress → implement Skill 호출 |
| 3b | Q&A 인터뷰: Plan 내용 질의응답 → 완료 후 다시 선택(2단계) |
| 3c | 합의 리뷰: 아래 §합의 리뷰 프로세스 수행 → 결과 제시 후 다시 선택(2단계) |

> **AI 권장 분기**: CL S1 태스크 4개 이상인 feature → (c)에 `(AI 권장)`. 그 외(태스크 3개 이하 또는 improvement-standard) → (a)에 `(AI 권장)`.

### 합의 리뷰 프로세스

선택지 (c) 선택 시 Architect→Critic 순차 합의 리뷰를 수행한다.

| 단계 | 행위 |
|------|------|
| R1 | **Architect 리뷰**: `oh-my-claudecode:architect` (opus). 아키텍처 건전성 + steelman antithesis(최강 반론) + 실질적 tradeoff tension. plan.md + cl.md + Linear description을 입력으로 전달. **R2 시작 전 완료 대기 필수** |
| R2 | **Critic 리뷰**: `oh-my-claudecode:critic` (opus). Architect 피드백을 포함하여 품질 기준 평가 — 원칙-옵션 일관성, 리스크 완화, 검증 가능한 수락 기준. 판정 반환: **APPROVE** / **ITERATE** / **REJECT** |
| R3 | **판정 분기**: 아래 참조 |

**판정 분기:**

| 판정 | 행동 |
|------|------|
| **APPROVE** | 리뷰 결과 요약 + Linear comment 기록 → Post-Plan Q/A 2단계로 복귀 (사용자 최종 선택) |
| **ITERATE** | Architect + Critic 피드백을 반영하여 plan.md 수정 → R1으로 복귀 (최대 3회) |
| **REJECT** | 거부 사유를 사용자에게 제시 → Post-Plan Q/A 2단계로 복귀 (사용자가 Q&A/재수정/바로 구현 선택) |

> **루프 상한**: ITERATE 3회 소진 시 최종 피드백을 첨부하여 Post-Plan Q/A 2단계로 복귀. "합의 리뷰 3회 완료" 메시지와 함께 사용자가 최종 판단.
> **반복 횟수 표시**: 각 ITERATE 시 "합의 리뷰 iteration N/3" 을 사용자 프롬프트 + Linear comment에 표시.
> **순차 실행 필수**: R1(Architect) 완료 후 R2(Critic) 실행. 동시 호출 금지.

---

## Sub-issue 리마인딩

`/활성화` 시 child sub-issue가 존재하면 아래 프로세스를 수행한다.

| 단계 | 행위 |
|------|------|
| 1 | Linear MCP로 현재 Issue의 child sub-issue 목록 조회 (parentId 기반) |
| 2 | 각 sub-issue의 상태(State), type(Label), title 수집 |
| 3 | `_index.md` Notes의 Blocking 섹션 확인 (블로킹 여부 교차 검증) |
| 4 | 리마인딩 테이블 출력 (아래 형식) |
| 5 | `AskUserQuestion`으로 진행 방법 선택 |

### 리마인딩 테이블 형식

| Sub-issue | Type | State | 생성 사유 | Blocking |
|-----------|------|-------|----------|----------|
| PRJ-N | bug/improvement | Todo/In Progress/Done | Triage Log 또는 _index.md에서 추출 | Y/N |

### 진행 선택지

| 선택지 | 행동 |
|--------|------|
| 계속 진행 (Recommended) | 미완료 sub-issue 안내 후 현재 Issue 파이프라인 계속 |
| Sub-issue 먼저 처리 | 미완료 sub-issue 중 하나를 선택하여 `/활성화` |
| 대기 | 현재 세션 종료. sub-issue 완료 후 재활성화 안내 |

> 모든 sub-issue가 Done이면 리마인딩 테이블만 출력하고 자동 진행.
> Blocking sub-issue가 미완료이면 해당 항목을 강조 표시하고, pipeline.md §4-4a 블로킹 해제 프로세스와 연계.
> child sub-issue가 없으면 이 단계를 스킵.

---

## OMC 에이전트 연동

| type | 단계 | 에이전트 |
|------|------|---------|
| feature | Pre-Plan Q/A 코드 조사 | `oh-my-claudecode:explore` (haiku) |
| feature | Post-Plan Q/A 합의 리뷰 (R1) | `oh-my-claudecode:architect` (opus) |
| feature | Post-Plan Q/A 합의 리뷰 (R2) | `oh-my-claudecode:critic` (opus) |
| feature | 설계 단계 | opus |
| feature | 구현 단계 | sonnet (executor) |
| improvement | size 판별 + 라우팅 | dev-pipeline 직접 수행 |
| improvement | 이후 단계 | improvement-fix 스킬 위임 (light/standard별 에이전트 — [improvement-fix SKILL.md](../improvement-fix/SKILL.md) 참조) |
| bug | 탐색 | `oh-my-claudecode:explore` (haiku) |
| bug | Root Cause 분석 | `oh-my-claudecode:debugger` (sonnet) |
| bug | 코드 수정 | `oh-my-claudecode:executor` (sonnet) |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue 상태·type·assignee 조회 | `/활성화` 시 1회 |
| child sub-issue 목록 조회 | `/활성화` 시 1회 (parentId 기반 필터) |
| State → Planning 전이 | Pre-Plan Q/A 시작 전 즉시 |
| Label 기반 관련 Issue 검색 | 컨텍스트 수집용 (다수) |
