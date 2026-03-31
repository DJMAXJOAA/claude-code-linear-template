---
name: dev-pipeline
description: "Linear Issue 상태(State)와 type(Label)을 조회하고, progress.txt + spec.md + technical.md 기반 컨텍스트를 로드하여 적합한 스킬로 라우팅하는 통합 파이프라인 라우터."
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
| 2 (G1) | **Git 문서 확인**: `docs/issue/{LINEAR-ID}/` 폴더 존재 여부 확인. **폴더 미존재 시** `docs/issue/{LINEAR-ID}/` 폴더만 생성 + Linear description Documents 갱신. 존재 시 progress.txt(있으면)에서 컨텍스트 로드 |
| 3 (G1) | **type 판별**: Label에서 type 추출 (`feature` → feature 경로, `improvement` → size 판별 후 improvement-fix, `bug` → bug-fix) |
| 3a (G1) | **improvement size 판별** (improvement만): §improvement size 판별 참조. `/활성화` 재개 시 Label `Size: light`/`Size: standard` 확인 → 있으면 판별 스킵 (fallback: description Overview `Size` 행) |
| 4 (G1) | **라우팅 테이블 참조**: 현재 State + type + size 조합으로 다음 스킬 결정 |
| 5 (G2) | **skip 전이 + bug/imp-light 전이**: type에 `—`인 상태는 자동으로 다음 상태로 건너뜀. 추가로 bug/improvement-light의 Todo→In Progress 전이도 dev-pipeline이 라우팅 시 수행 |
| 5a (G1) | **Git 필독 규칙**: `/활성화` 시 — Linear → progress.txt(있으면) → spec.md → technical.md(있으면) 순서로 컨텍스트 로드. 재개 시 — progress.txt → plan.md Tasks → technical.md(있으면) 순서로 로드 |
| 6 (G4) | **스킬 호출**: 결정된 스킬을 호출하며, Linear ID + type + size + 관련 컨텍스트 전달 |

## Output

| 항목 | 내용 |
|------|------|
| 라우팅 결과 | 현재 상태에 해당하는 스킬 호출 |
| skip 전이 | type에 해당하지 않는 상태 자동 건너뜀 |

> **상태 전이 원칙**: 일반 상태 전이는 각 스킬이 자체 완료 시 수행. dev-pipeline은 **skip 전이 + bug/improvement-light의 Todo→In Progress 전이**를 담당.

---

## 라우팅 테이블

> type별 라우팅 상세 + bug 수정 프로세스: [routing-tables.md](routing-tables.md)

---

## improvement size 판별 (dev-pipeline 담당)

**시점**: `/활성화` → dev-pipeline Todo 단계, improvement type 감지 시.

| 단계 | 행위 |
|------|------|
| 1 | **재개 확인**: Label에서 `Size: light` / `Size: standard` 존재 확인 → 있으면 판별 스킵 → 기존 경로 자동 진행. **Fallback**: Label 미존재 + description Overview에 Size 행 있으면 해당 값 인정 (기존 Issue backward compat) |
| 2 | **AI 추천**: Linear description + title 분석하여 size 추천. light 조건(L1~L3 모두 충족 시): (L1) 새 클래스/인터페이스 생성 없음, (L2) 기존 로직 변경 없음(rename, 경로 이동, 패턴 일괄 적용, 코드 정리), (L3) 영향 범위가 명확(사이드이펙트 판단 불필요 또는 자명) |
| 3 | **`AskUserQuestion` 1회**: size 선택 — `light` (AI 추천 시 표시) / `standard` / 모르겠으면 standard |
| 4 | **Size Label 부착**: `Size: light` 또는 `Size: standard` Label을 Issue에 부착 (`save_issue` labelIds). description Overview에 Size 행 추가하지 않음 |
| 5 | **improvement-fix 스킬 호출**: size 인자 전달 |

---

## P1 계획수정 오케스트레이션 (dev-pipeline 담당)

**진입**: triage G4 반환값에서 P1 판정을 수신하여 오케스트레이션 시작.
(dev-pipeline은 `/점검` 호출의 상위 오케스트레이터이므로 triage 반환값을 직접 수신)

dev-pipeline이 다음을 순서대로 수행:
1. plan.md 수정 (Goal/Approach/Tasks 갱신) — `oh-my-claudecode:executor` (sonnet)
1a. progress.txt에 P1 수정 기록 (ralph가 관리): 'P1 계획수정: {수정 사유} — Tasks {리셋 ID 목록}'
2. plan.md Verification 갱신 (검증항목 리셋/추가) — 동일 executor
3. docs: 커밋 (plan.md 수정분)
4. implement Skill 재호출 (수정된 plan.md Tasks 기준으로 재개)
5. implement 완료 후 verify 자동 재실행
5a. **verify FAIL 시**: L3로 자동 에스컬레이션 — **gen-hub 경유** sub-issue 생성 (triage G4b 패턴 재사용, type: bug, parentId: 현재 Issue) 후 블로킹 라이프사이클 진입 (pipeline.md §4-4a).
    P1 자체수정 1회 시도 후 verify 통과 실패는 변경 범위가 P1 한계를 초과했음을 의미.

---

## Pre-Plan Q/A (feature 전용)

Todo 상태에서 gen-plan 호출 전, **deep-interview 기반 요구사항 결정화**를 수행하는 인터랙션.

### Step 0: 전처리

| 단계 | 행위 |
|------|------|
| 0a | **Linear 상태 갱신**: Linear MCP로 State → Planning 즉시 전이. Pre-Plan Q/A 시작을 Linear에 선반영 |
| 0b | **컨텍스트 수집**: Linear MCP로 related issue 조회 + Label 기반 관련 Issue 필터링 |
| 0c | **관련 문서 환류**: related issue의 `progress.txt` + `plan.md` 읽기 (최대 5개). 요약하여 Step 1에서 제시. 구현 결과 섹션은 gen-plan에서 별도 참조 |
| 0d | **progress.txt 컨텍스트 로드**: `docs/issue/{ID}/progress.txt` 존재 시 컨텍스트 로드 |
| 0e | **탐색 범위 결정**: `oh-my-claudecode:explore` 에이전트로 코드베이스 조사 위임 (환류 결과 기반 범위 설정) |

### Step 1: deep-interview 또는 deep-dive 호출

| 단계 | 행위 |
|------|------|
| 1 | **인터뷰 방식 선택**: `AskUserQuestion`으로 (a) `deep-interview` — 소크라테스식 인터뷰로 요구사항 결정화 (b) `deep-dive` — trace→deep-interview 2단계 파이프라인 (인과 분석 필요 시) (c) 이미 상세 스펙 있음 — 스킵 (기존 spec.md 활용) 선택 |
| 1a | **deep-interview 호출** (선택 a/b): `oh-my-claudecode:deep-interview` 또는 `oh-my-claudecode:deep-dive` 호출. Input: Linear description + 관련 문서 환류 결과 + 코드베이스 컨텍스트. Output: spec.md (OMC 네이티브) |
| 1b | **ambiguity threshold 확인**: deep-interview 완료 후 ambiguity > 20%이면 `AskUserQuestion`으로 모호한 항목을 명시하고 추가 확인 진행 |

### Step 2: 후처리

| 단계 | 행위 |
|------|------|
| 2a | **spec.md 저장**: deep-interview 산출물을 `docs/issue/{ID}/spec.md`에 저장. frontmatter 래핑 적용 (아래 참조) |
| 2b | **SC 추출 → Linear 기록**: spec.md에서 Success Criteria 섹션 추출 → Linear Issue description의 `## Success Criteria` 섹션에 삽입 |
| 2b-1 | **Linear comment 기록**: spec.md 완료 요약 comment — `Spec 완료 — {1줄 요약}. docs/issue/{ID}/spec.md` |
| 2c | **의존성 정렬**: spec.md 요구사항의 의존 관계 정렬. gen-plan 호출 인풋으로 전달 |
| 2d | **gen-plan 호출**: spec.md 완성 확인 → gen-plan 호출 (ralplan 위임) |

### spec.md Frontmatter 래핑 패턴

```yaml
---
linear_id: PRJ-N
title: "Spec: {제목}"
type: spec
created: YYYY-MM-DD
---
```

### OMC Fallback

> deep-interview 비활성 시 → 간소화 인터뷰로 fallback: `AskUserQuestion`으로 핵심 요구사항(What/Why) 직접 수집 → spec.md를 기본 모델로 생성.

> §11 인터뷰 원칙 적용 (pipeline.md 참조)
> improvement는 Pre-Plan Q/A를 사용하지 않는다. improvement-fix 스킬이 자체 Pre-Plan 인터뷰(standard: 4항목)를 수행.

## Post-Plan Q/A (feature / improvement-standard 공통)

Planning 상태에서 spec.md + plan.md 존재 확인 후, 다음 행동을 사용자에게 선택받는 인터랙션.

| 단계 | 행위 |
|------|------|
| 1 | Plan 핵심 요약 제시 (spec.md + plan.md Tasks 기반) |
| 2 | `AskUserQuestion`으로 사용자 선택: **(a)** 바로 구현 **(b)** Plan Q&A 인터뷰 |
| 3a | 바로 구현: spec.md + plan.md가 미커밋 상태이면 Git 커밋 수행 → Linear State → In Progress → implement Skill 호출 |
| 3b | Q&A 인터뷰: Plan 내용 질의응답 → 완료 후 다시 선택(2단계) |

> **AI 권장 분기**: plan.md Tasks 4개 이상인 feature → (b)에 `(AI 권장)`. 그 외(태스크 3개 이하 또는 improvement-standard) → (a)에 `(AI 권장)`.

### OMC Fallback

> ralplan 비활성 시 → 기존 Post-Plan Q/A에 Architect + Critic 병렬 합의 리뷰를 추가하여 수행 (ralplan이 내장하는 Planner/Architect/Critic 합의를 수동으로 대체).

---

## Sub-issue 리마인딩

`/활성화` 시 child sub-issue가 존재하면 아래 프로세스를 수행한다.

| 단계 | 행위 |
|------|------|
| 1 | Linear MCP로 현재 Issue의 child sub-issue 목록 조회 (parentId 기반) |
| 2 | 각 sub-issue의 상태(State), type(Label), title 수집 |
| 3 | Linear comment + progress.txt에서 블로킹 여부 교차 검증 |
| 4 | 리마인딩 테이블 출력 (아래 형식) |
| 5 | `AskUserQuestion`으로 진행 방법 선택 |

### 리마인딩 테이블 형식

| Sub-issue | Type | State | 생성 사유 | Blocking |
|-----------|------|-------|----------|----------|
| PRJ-N | bug/improvement | Todo/In Progress/Done | Triage Log 또는 Linear comment에서 추출 | Y/N |

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
| feature | Pre-Plan Q/A 요구사항 결정화 | `oh-my-claudecode:deep-interview` 또는 `oh-my-claudecode:deep-dive` |
| feature | 구현 단계 | sonnet (executor) |
| improvement | size 판별 + 라우팅 | dev-pipeline 직접 수행 |
| improvement | 이후 단계 | improvement-fix 스킬 위임 (light/standard별 에이전트 — [improvement-fix SKILL.md](../improvement-fix/SKILL.md) 참조) |
| bug | 패턴 분류 + 라우팅 | bug-fix 스킬 위임 (기본/경량/원인불명 3패턴 — [bug-fix SKILL.md](../bug-fix/SKILL.md) 참조) |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue 상태·type·assignee·Label 조회 | `/활성화` 시 1회 (Size Label 포함) |
| child sub-issue 목록 조회 | `/활성화` 시 1회 (parentId 기반 필터) |
| Size Label 부착 | improvement size 판별 후 `Size: light` / `Size: standard` Label 부착 (`save_issue` labelIds) |
| State → Planning 전이 | Pre-Plan Q/A 시작 전 즉시 |
| State → In Progress 전이 | bug/improvement-light 라우팅 시 |
| Label 기반 관련 Issue 검색 | 컨텍스트 수집용 (다수) |
| spec.md 완료 comment | Pre-Plan Q/A Step 2b-1 (spec.md 저장 + SC 갱신 직후) |
