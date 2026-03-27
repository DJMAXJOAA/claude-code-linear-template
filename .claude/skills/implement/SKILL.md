---
name: implement
description: "plan.md Tasks 기준 Micro-tasking 오케스트레이터. dev-pipeline에서 In Progress 단계 진입 시 호출. note.md Work Log + Handoff 병행 갱신."
---

# implement — Micro-tasking 오케스트레이터

plan.md Tasks 목록을 기준으로 Micro-tasking을 오케스트레이션한다.
태스크 선택 → 코드 작성 → 테스트 → 빌드 확인 → plan.md Tasks 갱신 + note.md Work Log append → Linear Sub-issue 갱신 루프. verify 완료 후 커밋 + Linear comment 1회.

## Trigger

- dev-pipeline에서 In Progress 단계 진입 시 (feature / improvement-standard)
- `/활성화`에서 In Progress 상태 재개 시

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` — Tasks 목록 (태스크 정의 + 상태), Verification (검증 조건) |
| note.md | `docs/issue/{LINEAR-ID}/note.md` — Work Log (태스크별 작업 기록 append), Handoff (배치 완료 시 덮어쓰기) |
| prd.md | `docs/issue/{LINEAR-ID}/prd.md` — 요구사항 참조 (필요 시에만 읽기) |
| type | `feature` / `improvement` (standard) — bug 및 improvement-light는 implement를 사용하지 않음 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **plan.md Tasks 상태 확인**: 모든 태스크가 `done`이면 → 완료 조건으로 직행 |
| 2 (G2) | **실행 모드 선택**: `AskUserQuestion`으로 사용자에게 모드 선택 |
| 3 (G4) | **태스크 실행 루프** 시작 |

## Output

| 항목 | 내용 |
|------|------|
| 코드 변경 | plan.md Tasks에 명시된 범위의 코드 + 테스트 |
| plan.md 갱신 | Tasks 상태 갱신 (태스크 완료 직후) |
| note.md 갱신 | Work Log append (태스크 완료 직후) + Handoff 덮어쓰기 (태스크 배치 완료 시) |
| 커밋 | verify 완료 후 커밋. 작업 규모가 크면 중간 커밋 허용 (Conventional Commits) |
| Linear comment | verify 완료 후 1회 — 전체 작업 내용 간략 요약 |
| Linear | Sub-issue 상태 Done + parent Issue State 전이 |

---

## 실행 모드

| 모드 | 설명 | 후속 흐름 |
|------|------|---------|
| **(a) 수동 구현** | AI가 직접 코드 작성. 태스크별 G2 승인 | §태스크 실행 루프 (공통) |
| **(b) executor 위임** | `oh-my-claudecode:executor`에 태스크별 위임 | §태스크 실행 루프 (공통) |
| **(c) ralph 루프** | `oh-my-claudecode:ralph`로 plan.md Tasks 전체 자동 실행 | ralph가 plan.md Tasks 기반 완료까지 반복 |
| **(d) 유저 구현** | 유저가 직접 구현. AI는 대기 → 유저 완료 신호 후 verify만 수행 | §유저 구현 흐름 |

---

## Linear sub-issue 동기화

| 트리거 | 행동 |
|--------|------|
| Plan 생성 시 | plan.md Tasks 태스크별 sub-issue 생성 (best-effort. 실패 시 진행 중단 안 함) |
| 태스크 시작/완료 | sub-issue state → In Progress / Done |
| plan.md Tasks 태스크 변경 | 추가: 새 sub-issue 생성. 삭제/변경: 수동 정리 |
| 동기화 방향 | plan.md Tasks → Linear (단방향). plan.md Tasks가 SSOT |

---

## 태스크 실행 루프 (공통)

| 단계 | 행위 |
|------|------|
| 3-1 | **태스크 선택**: plan.md Tasks 의존성 기반 — Dependencies 모두 `done`인 태스크 중 ID 순 |
| 3-2 | **코드 구현**: 모드에 따라 직접 작성(a) 또는 executor 위임(b) |
| 3-3 | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 3-4 | **plan.md Tasks 갱신**: 태스크 상태 → `done` + **note.md Work Log append** (완료 태스크 1줄 요약) |
| 3-5 | **Linear Sub-issue 갱신**: Sub-issue State → Done |
| 3-6 | **L1 인라인 요약 출력** |
| 3-7 | **중간 커밋** (작업 규모가 큰 경우, 선택적) |
| 3-8 | **note.md Handoff 갱신** (태스크 배치 완료 시 Handoff 섹션 덮어쓰기) |
| 3-9 | 다음 태스크로 루프 (3-1) — 모든 태스크 `done` 시 완료 조건 처리 |

### 모드별 차이 (3-2 단계)

| 모드 | 3-2 실행 방식 | G2 승인 |
|------|-------------|---------|
| **(a) 수동** | AI가 직접 코드 작성 | 태스크별 G2 필수 |
| **(b) executor** | `oh-my-claudecode:executor`에 위임 | executor 결과 확인 |
| **(c) ralph** | `oh-my-claudecode:ralph`로 plan.md Tasks 전체 자동 | ralph 자체 판단 |
| **(d) 유저 구현** | 유저가 직접 구현 | 없음 (유저 자체 판단) |

> 모드 (b)에서 독립 태스크 복수 시 executor 동시 투입 가능.

---

## 유저 구현 흐름 (모드 d)

plan.md + note.md 기반으로 유저가 직접 구현하고, AI는 검증만 수행한다.

| 단계 | 행위 |
|------|------|
| d-1 | plan.md Tasks 태스크 목록 요약 출력 (유저 참조용) |
| d-2 | `AskUserQuestion`: "구현을 완료하면 알려주세요" — 유저 작업 대기 |
| d-3 | 유저 완료 신호 수신 |
| d-4 | git diff 분석 → plan.md Tasks 태스크와 변경 내용 대조 |
| d-5 | plan.md Tasks 태스크 상태 일괄 갱신 (완료된 태스크 체크) |
| d-6 | Linear sub-issue 상태 일괄 갱신 |
| d-7 | verify 자동 호출 (기존 완료 조건 §4-3과 동일) |
| d-8 | verify 결과에 따라 기존 완료 조건(§4-4~4-6) 진행 |

> 유저 구현 중에도 중간 질문은 가능 (채팅으로).
> d-4에서 plan.md Tasks과 diff가 불일치하면 `AskUserQuestion`으로 확인.
> 세션 중단 시: 유저가 구현 완료 후 새 세션에서 `/활성화`로 재개하거나, `/정리`로 사후 처리 가능.

---

## 완료 조건

| 단계 | 행위 |
|------|------|
| 4-1 | plan.md Tasks 모든 태스크 상태 = `done` 확인 |
| 4-2 | 최종 빌드/테스트 통과 확인 (전체 테스트 스위트) |
| 4-3 | **verify 자동 호출**: verify 스킬 호출하여 SC + plan.md Verification 검증 수행 |
| 4-4 | verify PASS 시: 미커밋 변경사항 Git 커밋 + **Linear comment 1회** (전체 작업 내용 간략 요약) |
| 4-5 | **Linear State → In Review** (implement가 전이 수행) |
| 4-6 | verify FAIL 시 실패 항목 목록 + 수정 방안 제시 → 태스크 루프로 복귀 |

---

## OMC 에이전트 연동

| 모드 | 에이전트 | 모델 |
|------|---------|------|
| executor 위임 | `oh-my-claudecode:executor` | sonnet |
| ralph 루프 | `oh-my-claudecode:ralph` | (자체 모델 선택) |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Sub-issue State → Done | 태스크 완료마다 |
| 전체 작업 내용 요약 comment | verify PASS 시 1회 |
| parent Issue State → In Review | verify PASS 시 |
