# dev-pipeline 라우팅 테이블

type별 라우팅 상세 + bug 수정 프로세스.

## feature

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **Linear → Planning 즉시 전이** → **Pre-Plan Q/A** → gen-plan | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → implement | In Progress |
| In Progress | implement Skill | In Progress (태스크 진행) |
| In Progress (점검 P1) | dev-pipeline: plan.md 수정 조율 → implement Skill 재호출 | In Progress (태스크 재진행) |
| In Progress (점검 plan-L3) | `/등록` (sub-issue) → 블로킹 라이프사이클 | In Progress (블로킹) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> implement가 verify 호출 → PASS 확인 → Linear State `In Review` 전이까지 수행.

## improvement

size 판별(dev-pipeline 담당) 결과에 따라 light/standard 분기. improvement-fix 스킬이 오케스트레이션.

### improvement (light)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **size 판별** → improvement-fix (light) 호출 | In Progress |
| In Progress | improvement-fix (light) Skill | In Progress (수정 진행) |
| In Progress (모든 수정 done) | verify 자동 호출 (bug-like fallback) → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (축약 경로) | Done |
| Done | 완료 안내 | — |

> light는 Planning 상태를 건너뛴다. Git 폴더 + note.md 생성. prd.md/plan.md는 인터뷰 분기(선택).
> light → standard 에스컬레이션(코드 수정 전): In Progress 내에서 Planning 진입 (§1-4 예외).

### improvement (standard)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | **size 판별** → improvement-fix (standard): **Pre-Plan 인터뷰(4항목)** → gen-plan | Planning |
| Planning (plan.md 존재) | **Post-Plan 확인** → implement | In Progress |
| In Progress | implement Skill (기존 재활용) | In Progress (태스크 진행) |
| In Progress (점검 P1) | dev-pipeline: plan.md 수정 조율 → implement Skill 재호출 | In Progress (태스크 재진행) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (improvement-standard 경로) | Done |
| Done | 완료 안내 | — |

> standard는 기존 gen-plan + implement 스킬을 그대로 재활용한다.

## bug

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| (전 State 공통) | **Sub-issue 상태 확인** → 미완료 시 리마인딩 + 사용자 선택 (§Sub-issue 리마인딩) | — |
| Todo | bug-fix Skill 호출 | In Progress |
| In Progress | bug-fix Skill (수정 + verify 자동 호출) | In Review |
| In Review | 사용자 직접 확인 → 승인 시 issue-close 자동 호출 (축약 경로) | Done |
| Done | 완료 안내 | — |

## bug 수정 프로세스

> bug 수정 상세 프로세스: [bug-fix SKILL.md](../bug-fix/SKILL.md)
>
> bug-fix 스킬이 탐색 → 분석 → 수정 → verify → In Review 전이까지 오케스트레이션.
> 복잡한 버그로 판단될 경우, 사용자 승인 하에 improvement type으로 전환하여 Plan → implement 경로 사용 가능.

## In Review (전 type 공통)

| 단계 | 행위 |
|------|------|
| 1 | 사용자에게 수동 확인 안내 (수동 테스트, 코드 리뷰 등) |
| 2 | 사용자 승인 시 issue-close 자동 호출 → Done |
| 3 | 사용자가 문제 발견 시 → 새 Issue 등록 (역방향 전이 금지) |
