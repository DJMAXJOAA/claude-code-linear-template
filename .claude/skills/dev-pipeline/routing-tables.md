# dev-pipeline 라우팅 테이블

type × intensity 조합별 라우팅 상세. 새 파이프라인(spec v2) 기준.

## 총괄 라우팅 테이블

| Type | Intensity | State Flow | Agent Chain | Artifacts |
|------|-----------|-----------|-------------|-----------|
| feature | Light | Todo→Planning→In Progress→In Review→Done | explore → planner → executor → verify | spec.md(간소) + plan.md(간소) |
| feature | Standard | Todo→Planning→In Progress→In Review→Done | explore → analyst → ralplan → ralph → verify | spec.md + plan.md + technical.md |
| feature | Deep | Todo→Planning→In Progress→In Review→Done | explore → deep-interview → ralplan(--deliberate) → autopilot → verify | spec.md(심층) + plan.md + technical.md |
| improvement | Light | Todo→In Progress→In Review→Done | code-reviewer → plan(터미널) → executor → verify → simplify(skill) | Git 문서 없음 |
| improvement | Standard | Todo→Planning→In Progress→In Review→Done | code-reviewer → plan → architect → executor → verify → simplify(skill) | spec.md + plan.md |
| improvement | Deep | Todo→Planning→In Progress→In Review→Done | code-reviewer + security-reviewer → deep-interview → ralplan(--deliberate) → autopilot → verify | spec.md + plan.md + technical.md |
| bug | Light | Todo→In Progress→In Review→Done | debugger → plan(터미널) → executor → verify | Git 문서 없음 (Linear comment) |
| bug | Deep | Todo→In Progress→In Review→Done | trace(skill) → debugger → architect → executor → qa-tester(선택) → verify | Git 문서 없음 (Linear structured comment) |

> **bug 3패턴 매핑**: 기존 3패턴(기본/경량/원인불명) → 기본=Light, 경량=Light, 원인불명=Deep

---

## feature

### feature (Light)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **Linear → Planning 즉시 전이** → **explore** → **planner** → spec.md(간소) + plan.md(간소) 산출 + gen-plan(Light) | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → executor 단독 실행 | In Progress |
| In Progress | executor 단독 실행 — plan.md Tasks 진행 | In Progress (태스크 진행) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> Light는 ralph 루프 없이 executor 단독으로 실행한다.

### feature (Standard)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **Linear → Planning 즉시 전이** → **explore** → **analyst** → Pre-Plan Q/A → spec.md 산출 → ralplan(gen-plan normal) | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → ralph(implement) 루프 | In Progress |
| In Progress | ralph(implement) — prd.json+progress.txt 갱신 | In Progress (태스크 진행) |
| In Progress (점검 P1) | dev-pipeline: plan.md 수정 조율 → ralph(implement) 재호출 | In Progress (태스크 재진행) |
| In Progress (점검 plan-L3) | `/등록` (sub-issue) → 블로킹 라이프사이클 | In Progress (블로킹) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> Standard는 ralplan(gen-plan) + ralph(implement) 스킬을 재활용한다.

### feature (Deep)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **Linear → Planning 즉시 전이** → **explore** → **deep-interview** → spec.md(심층) 산출 → ralplan(gen-plan --deliberate) | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → autopilot 실행 | In Progress |
| In Progress | autopilot — prd.json+progress.txt 갱신 | In Progress (태스크 진행) |
| In Progress (점검 P1) | dev-pipeline: plan.md 수정 조율 → autopilot 재호출 | In Progress (태스크 재진행) |
| In Progress (점검 plan-L3) | `/등록` (sub-issue) → 블로킹 라이프사이클 | In Progress (블로킹) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> Deep은 deep-interview로 요구사항을 심층 인터뷰하고 ralplan --deliberate 플래그로 계획 신중도를 높인다.

---

## improvement

intensity 판별(dev-pipeline 담당) 결과에 따라 Light/Standard/Deep 분기. improvement-fix 스킬이 오케스트레이션.

### improvement (Light)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **intensity 판별** → **code-reviewer** → plan(터미널) → 사용자 승인 | In Progress (dev-pipeline이 전이) |
| In Progress | executor → verify → simplify(skill) | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (축약 경로) | Done |
| Done | 완료 안내 | — |

> Light는 Planning 상태를 건너뛴다. Git 문서(docs/issue/) 생성 없음.
> Light → Standard 에스컬레이션(코드 수정 전): In Progress 내에서 Planning 진입 (§1-4 예외).

### improvement (Standard)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **intensity 판별** → **code-reviewer** → plan → architect → spec.md 산출 → ralplan(gen-plan) | Planning |
| Planning (plan.md 존재) | **Post-Plan 확인** → executor | In Progress |
| In Progress | executor → verify → simplify(skill) — prd.json+progress.txt 갱신 | In Progress (태스크 진행) |
| In Progress (점검 P1) | dev-pipeline: plan.md 수정 조율 → executor 재호출 | In Progress (태스크 재진행) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (improvement-standard 경로) | Done |
| Done | 완료 안내 | — |

### improvement (Deep)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **intensity 판별** → **code-reviewer + security-reviewer** (병렬) → deep-interview → ralplan(gen-plan --deliberate) | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → autopilot 실행 | In Progress |
| In Progress | autopilot — prd.json+progress.txt 갱신 | In Progress (태스크 진행) |
| In Progress (점검 P1) | dev-pipeline: plan.md 수정 조율 → autopilot 재호출 | In Progress (태스크 재진행) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> Deep은 보안 리뷰(security-reviewer)를 code-reviewer와 병렬로 수행한다.

---

## bug

bug는 Planning 상태를 모든 intensity에서 건너뛴다. Git 폴더(docs/issue/) 생성 없음. Linear comment로 로그 기록.

### bug (Light)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **intensity 판별** → **debugger** → plan(터미널) → 사용자 승인 | In Progress (dev-pipeline이 전이) |
| In Progress | executor → verify — Linear comment 로그 기록 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (축약 경로) | Done |
| Done | 완료 안내 | — |

> Linear comment 로그: 원인 분석, 수정 내용, verify 결과 요약.

### bug (Deep)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **intensity 판별** → **trace(skill)** → **debugger** → architect → 사용자 승인 | In Progress (dev-pipeline이 전이) |
| In Progress | executor → qa-tester(선택) → verify — Linear structured comment 로그 기록 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (축약 경로) | Done |
| Done | 완료 안내 | — |

> Linear structured comment 로그: 인과 추적 결과, 근본 원인, 수정 내용, qa-tester 결과(수행 시), verify 결과.
> 복잡한 버그로 판단될 경우, 사용자 승인 하에 improvement type으로 전환하여 Plan → implement 경로 사용 가능.

---

## In Review (전 type 공통)

| 단계 | 행위 |
|------|------|
| 1 | 사용자에게 수동 확인 안내 (수동 테스트, 코드 리뷰 등) |
| 2 | 사용자 승인 시 issue-close 자동 호출 → Done |
| 3 | 사용자가 문제 발견 시 → `/점검`으로 triage 분류. rework 판정 시 In Progress 복귀 (pipeline.md §1-4 예외 3). 그 외(L3/backlog) → 새 Issue 등록 |

---

## OMC 도구 매핑 요약

| 단계 | OMC 도구/스킬 | 역할 |
|------|-------------|------|
| Pre-Plan (feature Light) | explore → planner + gen-plan(Light) | 탐색 → 간소 명세·계획 산출 |
| Pre-Plan (feature Standard) | explore → analyst → ralplan | 탐색 → 분석 → 표준 계획 산출 |
| Pre-Plan (feature/improvement Deep) | explore → deep-interview → ralplan(--deliberate) | 탐색 → 심층 인터뷰 → 신중 계획 산출 |
| Pre-Plan (improvement Light/Standard) | code-reviewer → plan/architect | 코드 리뷰 → 계획 |
| Pre-Plan (improvement Deep) | code-reviewer + security-reviewer → deep-interview | 코드+보안 리뷰(병렬) → 심층 인터뷰 |
| Pre-Plan (bug Light) | debugger → plan(터미널) | 디버깅 → 터미널 계획 |
| Pre-Plan (bug Deep) | trace(skill) → debugger → architect | 인과 추적 → 디버깅 → 아키텍처 검토 |
| Planning | ralplan(gen-plan) | plan.md + technical.md 생성 |
| In Progress (feature Light / improvement) | executor | plan.md Tasks 실행 |
| In Progress (feature Standard) | ralph(implement) | plan.md Tasks 자동 실행. prd.json+progress.txt 갱신 |
| In Progress (feature/improvement Deep) | autopilot | plan.md Tasks 자율 실행. prd.json+progress.txt 갱신 |
| 코드 품질 (improvement) | simplify(skill) | 구현 후 코드 품질 검토 및 개선 |
| Verify | verify | Success Criteria + Verification 검증 |
| Done | issue-close | progress.txt 기반 완료 처리. Linear comment + Done 전이 |
