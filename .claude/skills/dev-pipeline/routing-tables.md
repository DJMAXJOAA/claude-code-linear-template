# dev-pipeline 라우팅 테이블

type별 라우팅 상세 + bug 수정 프로세스.

## feature

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Backlog | **Pre-Plan Q/A** → gen-plan | Planning |
| Planning (plan.md 존재) | **Post-Plan Q/A** → implement | In Progress |
| In Progress | implement Skill | In Progress (태스크 진행) |
| In Progress (모든 태스크 done) | 수동 테스트 가이드 출력 → `/점검` 대기 | Testing |
| Testing | test Skill | Verifying |
| Verifying | verify Skill 호출 → PASS 시 G2 확인 후 feature-close 자동 호출 | Done |
| Done | 완료 안내 | — |

## bug

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Backlog | Root Cause 분석 시작 | In Progress |
| In Progress | 수정(Fix) 구현 | Verifying |
| Verifying | verify Skill 호출 → PASS 시 G2 확인 후 feature-close 자동 호출 | Done |
| Done | 완료 안내 | — |

## bug 수정 프로세스 (implement 미사용)

bug type은 CL 없이 직접 수정한다. dev-pipeline이 아래 프로세스를 오케스트레이션한다.

| 단계 | 행위 |
|------|------|
| 1 | Root Cause 분석 — 코드베이스 탐색 + `_index.md > ## Notes > ### Root Cause` placeholder를 분석 결과로 갱신 |
| 2 | 수정 계획 제시 (G1) → 사용자 승인 (G2) |
| 3 | 코드 수정 + 테스트 |
| 4 | 커밋 (`fix: ...`) |
| 5 | Linear State → Verifying |

> 복잡한 버그로 판단될 경우, 사용자 승인 하에 improvement type으로 전환하여 Plan → implement 경로 사용 가능

## improvement

| 현재 State | 라우팅 대상 | 완료 후 State |
|-----------|-----------|-------------|
| Backlog | **Pre-Plan Q/A** (간략) → gen-plan | Planning |
| Planning (plan.md 존재) | implement Skill | In Progress |
| In Progress | implement Skill | Verifying |
| Verifying | verify Skill 호출 → PASS 시 G2 확인 후 feature-close 자동 호출 | Done |
| Done | 완료 안내 | — |

> improvement는 Post-Plan Q/A 생략 — Plan이 간략하므로 바로 구현 진입
> improvement 구현 중 설계 결정 발생 시 `_index.md > ## Decisions`에 기록한다.

