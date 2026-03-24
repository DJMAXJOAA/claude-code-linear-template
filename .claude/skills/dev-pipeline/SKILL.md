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

Todo 상태에서 gen-plan 호출 전, 설계 결정 확인 + 코드베이스 조사를 수행하는 인터랙션.

| 단계 | 행위 |
|------|------|
| 0 | **Linear 상태 갱신**: Linear MCP로 State → Planning 즉시 전이. Pre-Plan Q/A 시작을 Linear에 선반영 |
| 1 | **컨텍스트 수집**: Linear MCP로 related issue 조회 + Label 기반 관련 Issue 필터링 |
| 1a | **관련 문서 환류**: related issue의 `_index.md`(Decisions, Notes) + `plan.md` 읽기 (최대 5개). 요약하여 step 2에서 제시. 구현 결과 섹션은 gen-plan에서 별도 참조 |
| 2 | **스코프/조사 인터뷰**: step 1a 환류 결과를 요약 제시한 뒤, `AskUserQuestion`으로 (a) explore 탐색 범위(전체/특정 모듈/최소) (b) `/조사`(investigation) 실행 여부를 확인 |
| 3 | **코드베이스 조사**: 인터뷰 결과에 따라 `oh-my-claudecode:explore` 에이전트로 코드베이스 조사 위임. 조사 선택 시 investigation 스킬 호출 |
| 4 | **How 인터뷰**: `AskUserQuestion`으로 5항목 확인 (SC, 스펙, Decisions, 리스크, 범위) |
| 5 | **SC를 Linear description에 기록**: 확정된 SC를 Linear Issue description의 `## Success Criteria` 섹션에 삽입 |
| 6 | **_index.md 갱신**: `## Decisions`에 설계 결정 기록, `## Notes`에 조사 결과 요약 + 스코프 범위 기록. gen-plan 호출 전 수집 정보를 Git에 선저장 |

> §11 인터뷰 원칙 적용 (pipeline.md 참조)
> improvement는 Pre-Plan Q/A를 사용하지 않는다. improvement-fix 스킬이 자체 Pre-Plan 인터뷰(standard: 4항목)를 수행.

## Post-Plan Q/A (feature 전용)

Planning 상태에서 plan.md + cl.md 존재 확인 후, 다음 행동을 사용자에게 선택받는 인터랙션.

| 단계 | 행위 |
|------|------|
| 1 | Plan+CL 핵심 요약 제시 |
| 2 | `AskUserQuestion`으로 사용자 선택: **(a)** 바로 구현 (AI 권장) **(b)** Plan Q&A 인터뷰 **(c)** AI 리뷰 (`oh-my-claudecode:critic`) |
| 3a | 바로 구현: plan.md + cl.md + _index.md가 미커밋 상태이면 Git 커밋 수행 → Linear State → In Progress → implement Skill 호출 |
| 3b | Q&A 인터뷰: Plan 내용 질의응답 → 완료 후 다시 선택(2단계) |
| 3c | AI 리뷰: `oh-my-claudecode:critic` 에이전트로 리뷰 → 결과 제시 후 다시 선택(2단계) |

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
| feature | Post-Plan Q/A AI 리뷰 | `oh-my-claudecode:critic` (opus) |
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
