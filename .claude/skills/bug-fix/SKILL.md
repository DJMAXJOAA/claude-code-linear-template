# bug-fix — 버그 수정 오케스트레이터

bug type Issue의 수정 프로세스를 오케스트레이션한다. CL/plan 없이 직접 수정하며, Git 문서(`docs/issue/`)는 생성하지 않는다. Linear issue만을 원천으로 사용한다.

## Trigger

- dev-pipeline에서 bug type Issue의 In Progress 단계 진입 시
- `/활성화`에서 bug type Issue가 In Progress 상태일 때 재개

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, Acceptance Criteria) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **탐색**: `oh-my-claudecode:explore` 에이전트로 관련 코드 탐색. 버그 증상과 연관된 파일/모듈 식별 |
| 2 (G1) | **분석**: `oh-my-claudecode:debugger` 에이전트로 Root Cause 분석. 재현 경로, 원인 코드 위치 특정 |
| 3 (G1) | **수정 계획 제시**: Root Cause + 수정 방안을 사용자에게 제시 |
| 4 (G2) | **사용자 승인**: `AskUserQuestion`으로 수정 계획 확인. 승인 전 코드 수정 시작 금지 |
| 5 (G4) | **코드 수정**: `oh-my-claudecode:executor` 에이전트로 수정 구현 + 테스트 |
| 6 (G4) | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 7 (G4) | **코드 수정 완료 + 커밋**: `fix: ...` (Conventional Commits) |
| 8 (G4) | **verify 자동 호출**: verify 스킬로 Acceptance Criteria 검증 |
| 9 (G3) | verify PASS 시: **Linear State → In Review** + Root Cause + fix 요약 **Linear comment** 기록 |
| 10 | **In Review → Done**: 사용자 직접 확인 → 승인 시 **issue-close 자동 호출** (축약 경로: 검토→Done→comment→참조 문서 동기화) |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 5로 복귀

## Output

| 항목 | 내용 |
|------|------|
| 코드 변경 | 버그 수정 + 테스트 |
| 커밋 | `fix: ...` (Conventional Commits) |
| Linear comment | Root Cause + fix 요약 |
| Linear | State → In Review (verify PASS 시) |

> Git 문서(`docs/issue/`, `_index.md`)는 생성하지 않는다. 모든 기록은 Linear comment로 관리.

---

## complexity 전환

| 조건 | 행동 |
|------|------|
| 복잡한 버그로 판단 | `AskUserQuestion`으로 사용자에게 improvement type 전환 제안 |
| 전환 승인 시 | Linear Label을 `improvement`로 변경 → Plan → implement 경로 사용 |
| 판단 기준 | 수정 대상 파일 3개 이상, 모듈 간 영향, 설계 변경 필요 시 |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 탐색 | `oh-my-claudecode:explore` | haiku |
| Root Cause 분석 | `oh-my-claudecode:debugger` | sonnet |
| 코드 수정 | `oh-my-claudecode:executor` | sonnet |
| 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description에서 AC 조회 | 수정 시작 전 1회 |
| State → In Review 전이 | verify PASS 시 |
| Root Cause + fix 요약 기록 | verify PASS 후 comment |
