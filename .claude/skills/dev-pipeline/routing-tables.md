# dev-pipeline 라우팅 테이블

type별 라우팅 상세 + bug 수정 프로세스.

## feature / improvement (통합)

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Todo | **Linear → Planning 즉시 전이** → **Pre-Plan Q/A** → gen-plan | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → implement | In Progress |
| In Progress | implement Skill | In Progress (태스크 진행) |
| In Progress (모든 태스크 done) | verify 자동 호출 → PASS 시 In Review 전이 | In Review |
| In Review | 사용자 직접 확인 → 승인 시 feature-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> feature와 improvement는 동일 파이프라인. Pre-Plan Q/A에서 improvement는 간략 버전(3항목)으로 수행.
> implement가 verify 호출 → PASS 확인 → Linear State `In Review` 전이까지 수행.

## bug

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Todo | bug-fix Skill 호출 | In Progress |
| In Progress | bug-fix Skill (수정 + verify 자동 호출) | In Review |
| In Review | 사용자 직접 확인 → 승인 시 feature-close(경량) 자동 호출 | Done |
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
| 2 | 사용자 승인 시 feature-close 자동 호출 → Done |
| 3 | 사용자가 문제 발견 시 → 새 Issue 등록 (역방향 전이 금지) |
