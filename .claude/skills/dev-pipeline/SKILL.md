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
| 1 (G1) | **Linear 상태 조회**: Linear MCP로 Issue의 현재 State + type(Label) + assignee + description(SC 포함) + relations 조회. **조회 결과를 `linear_payload`로 캐싱하여 하류 스킬에 전달** (§Linear Context Forwarding 참조) |
| 1a (G1) | **Sub-issue 상태 확인**: Linear MCP로 현재 Issue의 child sub-issue 전체 조회. 미완료 항목 존재 시 §Sub-issue 리마인딩 수행 |
| 2 (G1) | **Git 문서 확인**: `docs/issue/{LINEAR-ID}/` 폴더 존재 여부 확인. **bug 및 improvement-Light는 Git 폴더 생성을 스킵**한다. 그 외 type/intensity에서 **폴더 미존재 시** 폴더만 생성 + Linear description Documents 갱신. 존재 시 progress.txt(있으면)에서 컨텍스트 로드 |
| 3 (G1) | **type 판별 → intensity 선택 → routing**: Label에서 type 추출 → §Intensity 선택 수행 → type + intensity 조합으로 라우팅 |
| 4 (G1) | **라우팅 테이블 참조**: 현재 State + type + intensity 조합으로 다음 스킬 결정 |
| 5 (G2) | **skip 전이 + Light 전이**: type에 `—`인 상태는 자동으로 다음 상태로 건너뜀. 추가로 bug/improvement-light/feature-light의 Todo→In Progress 전이도 dev-pipeline이 라우팅 시 수행 |
| 5a (G1) | **Git 필독 규칙**: `/활성화` 시 — Linear → progress.txt(있으면) → spec.md → technical.md(있으면) 순서로 컨텍스트 로드. 재개 시 — progress.txt → plan.md Tasks → technical.md(있으면) 순서로 로드 |
| 6 (G4) | **스킬 호출**: 결정된 스킬을 호출하며, Linear ID + type + intensity + **`linear_payload`** + 관련 컨텍스트 전달 |

## Output

| 항목 | 내용 |
|------|------|
| 라우팅 결과 | 현재 상태에 해당하는 스킬 호출 |
| skip 전이 | type에 해당하지 않는 상태 자동 건너뜀 |

> **상태 전이 원칙**: 일반 상태 전이는 각 스킬이 자체 완료 시 수행. dev-pipeline은 **skip 전이 + Light intensity(bug/improvement/feature)의 Todo→In Progress 전이**를 담당.

---

## Linear Context Forwarding

dev-pipeline이 Step 1에서 조회한 Linear Issue 정보를 `linear_payload`로 묶어 하류 스킬에 전달한다. 하류 스킬은 `linear_payload` 존재 시 Linear MCP 재조회를 스킵한다.

| 필드 | 내용 |
|------|------|
| `description` | Issue description 전문 (Overview, SC, Documents 등) |
| `type` | feature / improvement / bug |
| `labels` | Intensity Label 포함 전체 Label 목록 |
| `relations` | related / blocked-by Issue 목록 |
| `state` | 현재 State |

**하류 스킬 guard clause**: `linear_payload`가 전달되면 해당 정보를 사용하고 Linear MCP 조회를 스킵한다. `linear_payload`가 없으면(독립 호출 등) 기존대로 Linear MCP로 직접 조회한다.

**적용 대상**: gen-plan, verify, issue-close, bug-fix, improvement-fix

---

## 라우팅 테이블

> type별 라우팅 상세 + bug 수정 프로세스: [routing-tables.md](routing-tables.md)

---

## Intensity 선택 (전 type 공통)

**시점**: `/활성화` → dev-pipeline Todo 단계, type 감지 후.

### Step 1: Backward-compat 확인

| 조건 | 행동 |
|------|------|
| Label `Size: light` 존재 | `Intensity: Light`로 매핑. deprecation 안내 출력: "Size Label은 deprecated — Intensity Label로 자동 전환합니다." 라우팅 성공 후 `Size: light` Label 제거 + `Intensity: Light` Label 부착 (`save_issue` labelIds). 선택 UI 스킵 |
| Label `Size: standard` 존재 | `Intensity: Standard`로 매핑. 동일 deprecation 안내 + Label 교체. 선택 UI 스킵 |
| Label `Intensity: Light/Standard/Deep` 존재 | 기존 Intensity Label 유지. 선택 UI 스킵 |
| 해당 없음 | Step 2로 진행 |

### Step 2: AI 추천

Linear description + title을 분석하여 intensity를 추천한다. type별 휴리스틱:

**Feature**:
| Intensity | 조건 |
|-----------|------|
| Light | 변경 범위 < 3 파일 + 새 모듈 생성 없음 |
| Deep | 크로스 모듈 변경 + 아키텍처 변경 수반 |
| Standard | 위 조건에 해당하지 않는 경우 |

**Improvement**:
| Intensity | 조건 |
|-----------|------|
| Light | L1~L3 모두 충족: (L1) 새 클래스/인터페이스 생성 없음, (L2) 기존 로직 변경 없음(rename, 경로 이동, 패턴 일괄 적용, 코드 정리), (L3) 영향 범위가 명확(사이드이펙트 판단 불필요 또는 자명) |
| Deep | 크로스 모듈 변경 + 보안 영향 수반 |
| Standard | 위 조건에 해당하지 않는 경우 |

**Bug**:
| Intensity | 조건 |
|-----------|------|
| Light | 원인/수정 방법이 description에 이미 기술되어 있음 |
| Deep | 재현 불명확 또는 간헐적 발생 또는 영향 파일 3개 이상 |

> Bug는 Light/Deep 2단 분류. Standard 없음.

### Step 3: `AskUserQuestion` 1회 — intensity 선택

AI 추천 결과를 `(AI 권장)` 라벨과 함께 제시하고 사용자에게 선택을 요청한다.

- **Feature / Improvement**: `Light` / `Standard` / `Deep` 3택
- **Bug**: `Light` / `Deep` 2택

> 모르겠으면: Feature/Improvement → Standard, Bug → Deep 권장.

### Step 4: Intensity Label 부착

선택된 intensity에 따라 `Intensity: Light` / `Intensity: Standard` / `Intensity: Deep` Label을 Issue에 부착 (`save_issue` labelIds).

### Step 5: type별 스킬 라우팅

intensity 인자를 포함하여 type별 스킬로 라우팅:
- `feature` → intensity에 따라 dev-pipeline 내부 분기 (Pre-Plan Q/A 등)
- `improvement` → improvement-fix 스킬 호출 (intensity 인자 전달)
- `bug` → bug-fix 스킬 호출 (intensity 인자 전달)

---

## P1 계획수정 오케스트레이션

> 상세: [p1-orchestration.md](p1-orchestration.md)

---

## Pre-Plan Q/A (Feature Standard/Deep 전용)

> 상세: [pre-plan-qa.md](pre-plan-qa.md)

## Post-Plan Q/A (Feature/Improvement Standard/Deep 공통)

> 상세: [post-plan-qa.md](post-plan-qa.md)

---

## Sub-issue 리마인딩

> 상세: [sub-issue-reminding.md](sub-issue-reminding.md)

---

## OMC 에이전트 연동

| type | intensity | 단계 | 에이전트 |
|------|-----------|------|---------|
| feature | Light | explore → planner → executor | sonnet (planner, executor). Pre-Plan Q/A 스킵 |
| feature | Standard | Pre-Plan Q/A 코드 조사 | `oh-my-claudecode:explore` (haiku) |
| feature | Standard | Pre-Plan Q/A 요구사항 결정화 | `oh-my-claudecode:deep-interview` 또는 `oh-my-claudecode:deep-dive` |
| feature | Standard/Deep | 구현 단계 | sonnet (executor) |
| feature | Deep | Pre-Plan Q/A 요구사항 결정화 | `oh-my-claudecode:deep-interview` 필수 (스킵 불가) |
| 전 type | — | intensity 선택 | dev-pipeline 직접 수행 (§Intensity 선택) |
| improvement | Light/Standard/Deep | 이후 단계 | improvement-fix 스킬 위임 (intensity별 에이전트 — [improvement-fix SKILL.md](../improvement-fix/SKILL.md) 참조) |
| bug | Light/Deep | 패턴 분류 + 수정 | bug-fix 스킬 위임 (intensity별 에이전트 체인 — [bug-fix SKILL.md](../bug-fix/SKILL.md) 참조) |

> OMC 비활성 시: pipeline.md §7 참조.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue 상태·type·assignee·Label 조회 | `/활성화` 시 1회 (Intensity Label + Size Label 포함) |
| child sub-issue 목록 조회 | `/활성화` 시 1회 (parentId 기반 필터) |
| Intensity Label 부착 | intensity 선택 후 `Intensity: Light` / `Intensity: Standard` / `Intensity: Deep` Label 부착 (`save_issue` labelIds) |
| Size → Intensity Label 마이그레이션 | backward-compat: `Size: light/standard` Label 감지 시 대응하는 `Intensity: Light/Standard` Label로 교체. 기존 Size Label 제거 (`save_issue` labelIds) |
| State → Planning 전이 | Pre-Plan Q/A 시작 전 즉시 |
| State → In Progress 전이 | bug/Light intensity 라우팅 시 |
| Label 기반 관련 Issue 검색 | 컨텍스트 수집용 (다수) |
| spec.md 완료 comment | Pre-Plan Q/A Step 2b-1 (spec.md 저장 + SC 갱신 직후) |
