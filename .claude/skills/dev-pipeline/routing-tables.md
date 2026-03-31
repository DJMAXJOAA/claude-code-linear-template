# dev-pipeline 라우팅 테이블

type별 라우팅 상세. 새 파이프라인(spec v2) 기준.

## 총괄 라우팅 테이블

| Type | State Flow | 호출 스킬 | 산출물 |
|------|-----------|----------|--------|
| feature | Todo→Planning→In Progress→In Review→Done | deep-interview → ralplan(gen-plan) → ralph(implement) → verify → issue-close | spec.md → plan.md+technical.md → prd.json+progress.txt |
| improvement-standard | Todo→Planning→In Progress→In Review→Done | deep-interview → ralplan(gen-plan) → ralph(implement) → verify → issue-close | spec.md → plan.md+technical.md → prd.json+progress.txt |
| improvement-light | Todo→In Progress→In Review→Done | deep-dive → ralph → verify → issue-close | spec.md → prd.json+progress.txt |
| bug | Todo→In Progress→In Review→Done | 패턴별 에이전트 체인 → verify → issue-close | Linear comment (Git 문서 미생성) |

## feature

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **Linear → Planning 즉시 전이** → **deep-interview** → spec.md 산출 → ralplan(gen-plan) | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → ralph(implement) | In Progress |
| In Progress | ralph(implement) — prd.json+progress.txt 갱신 | In Progress (태스크 진행) |
| In Progress (점검 P1) | dev-pipeline: plan.md 수정 조율 → ralph(implement) 재호출 | In Progress (태스크 재진행) |
| In Progress (점검 plan-L3) | `/등록` (sub-issue) → 블로킹 라이프사이클 | In Progress (블로킹) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> ralph(implement)가 verify 호출 → PASS 확인 → Linear State `In Review` 전이까지 수행.

## improvement

size 판별(dev-pipeline 담당) 결과에 따라 light/standard 분기. improvement-fix 스킬이 오케스트레이션.

### improvement (light)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **size 판별** → improvement-fix (light): **deep-dive** → spec.md 산출 | In Progress (dev-pipeline이 전이) |
| In Progress | ralph — prd.json+progress.txt 갱신 | In Progress (수정 진행) |
| In Progress (모든 수정 done) | verify 자동 호출 (bug-like fallback) → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (축약 경로) | Done |
| Done | 완료 안내 | — |

> light는 Planning 상태를 건너뛴다. Git 폴더 생성.
> light → standard 에스컬레이션(코드 수정 전): In Progress 내에서 Planning 진입 (§1-4 예외).

### improvement (standard)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **size 판별** → improvement-fix (standard): **deep-interview** → spec.md 산출 → ralplan(gen-plan) | Planning |
| Planning (plan.md 존재) | **Post-Plan 확인** → ralph(implement) | In Progress |
| In Progress | ralph(implement) — prd.json+progress.txt 갱신 | In Progress (태스크 진행) |
| In Progress (점검 P1) | dev-pipeline: plan.md 수정 조율 → ralph(implement) 재호출 | In Progress (태스크 재진행) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (improvement-standard 경로) | Done |
| Done | 완료 안내 | — |

> standard는 기존 ralplan(gen-plan) + ralph(implement) 스킬을 그대로 재활용한다.

## bug

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **패턴 분류** (AskUserQuestion) → bug-fix Skill 호출 | In Progress (dev-pipeline이 전이) |
| In Progress | 패턴별 에이전트 체인 실행 — progress.txt 갱신 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (축약 경로) | Done |
| Done | 완료 안내 | — |

## bug 수정 프로세스

> bug 수정 상세 프로세스: [bug-fix SKILL.md](../bug-fix/SKILL.md)
>
> bug-fix 스킬이 작업 규모별 3패턴(기본/경량/원인불명)으로 분류 후, 패턴별 에이전트 체인으로 수정 → verify → In Review 전이까지 오케스트레이션.
> - **기본**: debugger → executor → test-engineer → verifier
> - **경량**: executor → code-reviewer → verifier
> - **원인불명**: tracer → debugger → executor → verifier
> 복잡한 버그로 판단될 경우, 사용자 승인 하에 improvement type으로 전환하여 Plan → implement 경로 사용 가능.

## In Review (전 type 공통)

| 단계 | 행위 |
|------|------|
| 1 | 사용자에게 수동 확인 안내 (수동 테스트, 코드 리뷰 등) |
| 2 | 사용자 승인 시 issue-close 자동 호출 → Done |
| 3 | 사용자가 문제 발견 시 → `/점검`으로 triage 분류. rework 판정 시 In Progress 복귀 (pipeline.md §1-4 예외 3). 그 외(L3/backlog) → 새 Issue 등록 |

## OMC 도구 매핑 요약

| 단계 | OMC 도구/스킬 | 역할 |
|------|-------------|------|
| Pre-Plan (feature/standard) | deep-interview | 요구사항 인터뷰 → spec.md 산출 |
| Pre-Plan (light) | deep-dive | 원인 조사 → spec.md 산출 |
| bug 패턴 분류 | bug-fix (AskUserQuestion) | 기본/경량/원인불명 3패턴 분류 |
| Planning | ralplan(gen-plan) | plan.md + technical.md 생성 |
| In Progress | ralph(implement) | plan.md Tasks 자동 실행. prd.json+progress.txt 갱신 |
| Verify | verify | Success Criteria + Verification 검증 |
| Done | issue-close | progress.txt 기반 완료 처리. Linear comment + Done 전이 |
