# implement — Micro-tasking 오케스트레이터

CL S1 태스크 목록을 기준으로 Micro-tasking을 오케스트레이션한다.
태스크 선택 → 코드 작성 → 테스트 → 빌드 확인 → CL S1 갱신 → Linear Sub-issue 갱신 → Task Log 기록 → 커밋 루프.

## Trigger

- dev-pipeline에서 In Progress 단계 진입 시 (feature, improvement)
- `/활성화`에서 In Progress 상태 재개 시

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| cl.md | `docs/{type}/{LINEAR-ID}/cl.md` — S1 태스크 목록, S2 완료 기준, S3 검증 조건 |
| plan.md | `docs/{type}/{LINEAR-ID}/plan.md` — 설계 참조 (필요 시에만 읽기) |
| type | `feature` / `improvement` — bug는 implement를 사용하지 않음 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **CL S1 상태 확인**: 모든 태스크가 `done`이면 → 완료 조건으로 직행 |
| 2 (G2) | **실행 모드 선택**: `AskUserQuestion`으로 사용자에게 모드 선택 |
| 3 (G4) | **태스크 실행 루프** 시작 |

## Output

| 항목 | 내용 |
|------|------|
| 코드 변경 | CL S1 태스크에 명시된 범위의 코드 + 테스트 |
| cl.md 갱신 | S1 태스크 상태, Handoff 섹션, S4 수동 테스트 (실제 구현 반영) |
| _index.md Task Log | 태스크 완료 시 `_index.md > ## Task Log`에 간략 로그 기록 |
| 커밋 | 태스크 1개 = 커밋 1개 (Conventional Commits) |
| Linear | Sub-issue 상태 Done + parent Issue State 전이 |

---

## 실행 모드

| 모드 | 설명 | 후속 흐름 |
|------|------|---------|
| **(a) 수동 구현** | AI가 직접 코드 작성. 태스크별 G2 승인 | 아래 §수동 구현 플로우 |
| **(b) executor 위임** | `oh-my-claudecode:executor`에 태스크별 위임 | 아래 §executor 위임 플로우 |
| **(c) ralph 루프** | `oh-my-claudecode:ralph`로 CL S1 전체 자동 실행 | ralph가 CL S1 기반 완료까지 반복 |

---

## 의존성 기반 실행

| 항목 | 내용 |
|------|------|
| 의존성 소스 | CL S1의 `depends` 속성 (태스크 간 선후 관계) |
| 병렬 실행 | 의존성 없는 태스크는 병렬 실행 가능 |
| 순차 실행 | 의존성 있는 태스크는 선행 태스크 완료 후 실행 |

## Linear sub-issue 동기화

| 트리거 | 행동 |
|--------|------|
| Plan+CL 생성 시 | CL S1 태스크별 Linear sub-issue 생성 (best-effort. 실패 시 CL S1이 SSOT이므로 진행에 영향 없음) |
| 태스크 시작 | sub-issue state → In Progress |
| 태스크 완료 | sub-issue state → Done |
| CL S1 태스크 변경 시 | 추가된 태스크: 새 sub-issue 생성. 삭제/변경: 기존 sub-issue는 수동 정리 (자동 삭제 안 함) |
| 동기화 방향 | CL S1 → Linear (단방향). CL이 SSOT, Linear sub-issue는 가시화 미러 |
| 장애 시 | pipeline.md §4 fallback 적용. sub-issue 갱신 실패해도 태스크 진행은 중단하지 않음 |

---

## 태스크 선택 규칙

| 조건 | 선택 방식 |
|------|---------|
| 기본 | CL S1 의존성 컬럼 기반 — Dependencies가 모두 `done`인 태스크 중 ID 순 선택 |
| 독립 태스크 복수 | 병렬 실행 가능 — 복수 executor 동시 투입 |
| 동일 파일 수정 태스크 | 직렬 실행 (의존 관계로 표기) |
| `blocked` 태스크 | 차단 사유 확인 → 사용자에게 해소 방안 제시 |

---

## 수동 구현 플로우 (모드 a)

| 단계 | 행위 |
|------|------|
| 3a-1 | **태스크 선택**: CL S1에서 다음 실행 가능 태스크 결정 |
| 3a-2 | 사용자에게 다음 태스크 계획 제시 (G1) |
| 3a-3 | 사용자 승인 (G2) 후 코드 작성 시작 |
| 3a-4 | 코드 구현 + 테스트 작성/실행 |
| 3a-5 | 빌드 확인: 린트 + 타입체크 + 테스트 통과 |
| 3a-6 | CL S1 태스크 상태를 `done`으로 갱신 |
| 3a-7 | **Linear Sub-issue 갱신**: Linear MCP로 해당 Sub-issue State → Done |
| 3a-8 | L1 인라인 요약 출력 + `_index.md > ## Task Log`에 간략 로그 기록 |
| 3a-9 | 커밋 (태스크 1개 = 커밋 1개) |
| 3a-10 | CL Handoff 섹션 갱신 |
| 3a-11 | 다음 태스크로 루프 (3a-1) — 모든 태스크 `done` 시 완료 조건 처리 |

---

## executor 위임 플로우 (모드 b)

| 단계 | 행위 |
|------|------|
| 3b-1 | **태스크 선택**: CL S1에서 다음 실행 가능 태스크 결정 |
| 3b-2 | `oh-my-claudecode:executor` 에이전트에 태스크 ID + CL + Plan(참조) 전달 |
| 3b-3 | Executor 에이전트가 코드 작성 + 테스트 작성/실행 |
| 3b-4 | 빌드 확인: 린트 + 타입체크 + 테스트 통과 |
| 3b-5 | CL S1 태스크 상태를 `done`으로 갱신 |
| 3b-6 | **Linear Sub-issue 갱신**: Linear MCP로 해당 Sub-issue State → Done |
| 3b-7 | L1 인라인 요약 (executor 출력) + `_index.md > ## Task Log`에 간략 로그 기록 |
| 3b-8 | 커밋 (태스크 1개 = 커밋 1개) |
| 3b-9 | CL Handoff 섹션 갱신 |
| 3b-10 | 의존성 해소된 독립 태스크 탐색 → 복수 executor 동시 투입 가능 |
| 3b-11 | 모든 태스크 `done` 시 완료 조건 처리 |

---

## 완료 조건

| 단계 | 행위 |
|------|------|
| 4-1 | CL S1 모든 태스크 상태 = `done` 확인 |
| 4-2 | 최종 빌드/테스트 통과 확인 (전체 테스트 스위트) |
| 4-3 | **CL S4 갱신**: 실제 구현 결과를 반영하여 S4 수동 테스트 가이드 갱신 (구현 전 작성된 항목 vs 실제 인터페이스 정합) |
| 4-4 | **수동 테스트 가이드 출력**: CL S4를 읽어 사용자에게 출력 |
| 4-5 | **`/점검` 안내 출력**: 수동 테스트 후 `/점검`으로 결과 전달 안내 |
| 4-6 | **완료 분기 대기**: `/점검` 사용 → triage 처리, "없음"/"완료" → 바로 다음 단계 전환 |
| 4-7 | feature: Linear State → Testing. improvement: Linear State → Verifying |

---

## OMC 에이전트 연동

| 모드 | 에이전트 | 모델 |
|------|---------|------|
| executor 위임 | `oh-my-claudecode:executor` | sonnet |
| ralph 루프 | `oh-my-claudecode:ralph` | (자체 모델 선택) |

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| 태스크 완료마다 | `save_issue` (id 지정) | Sub-issue State → Done |
| 전체 완료 시 | `save_issue` (id 지정) | parent Issue State 전이 (In Progress → Testing/Verifying) |
