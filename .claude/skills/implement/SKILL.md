---
name: implement
description: "ralph 루프로 plan.md Tasks 자동 실행. progress.txt 갱신."
---

# implement — Micro-tasking 오케스트레이터

plan.md Tasks를 `oh-my-claudecode:ralph` 루프로 자동 실행한다.
인터뷰 없이 즉시 시작. ralph가 태스크 선택 → 코드 구현 → 빌드 검증을 반복하고, 완료 후 verify → In Review 전이까지 수행한다.

## Trigger

- dev-pipeline에서 In Progress 단계 진입 시 (feature / improvement-Standard)
- `/활성화`에서 In Progress 상태 재개 시

> **참고**:
> - improvement-Deep 및 feature-Deep은 autopilot을 통해 implement를 간접 호출할 수 있음 (autopilot이 실행을 위임)
> - bug는 implement를 사용하지 않음 (bug-fix 스킬이 executor를 직접 실행)
> - improvement-Light는 implement를 사용하지 않음 (improvement-fix 스킬이 executor를 직접 실행)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` — Tasks 목록 + Verification (검증 조건) |
| spec.md | `docs/issue/{LINEAR-ID}/spec.md` — 요구사항 참조 (필요 시에만 읽기) |
| type | `feature` / `improvement` — bug 및 improvement-Light는 implement를 사용하지 않음 |
| intensity | `Light` / `Standard` / `Deep` — 실행 방식 분기 기준 (feature-Light, improvement-Standard/Deep 적용) |

---

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **plan.md Tasks 상태 확인**: 모든 태스크가 `done`이면 → §완료 조건으로 직행 |
| 2 (G4) | **intensity 분기**: 아래 §intensity 분기 참조 |

### intensity 분기

| intensity | 실행 방식 |
|-----------|-----------|
| **Light** (feature 전용) | executor 단독 실행. ralph 루프 없음. Single pass — plan.md Tasks를 순서대로 직접 실행 |
| **Standard** | ralph 루프 실행: `oh-my-claudecode:ralph`로 plan.md Tasks 전체 자동 실행 (현재 동작 유지) |
| **Deep** | autopilot 위임: ralph 대신 autopilot이 실행을 관장. implement는 autopilot의 실행 단계에서 호출됨 — §autopilot 위임 지시 참조 |

> Standard: ralph 호출 시 아래 §ralph 위임 지시를 프롬프트에 포함한다.

---

## ralph 위임 지시

> **적용 범위**: Standard intensity 전용

implement가 ralph에게 전달하는 실행 지침:

| 항목 | 지시 |
|------|------|
| **태스크 순서** | plan.md Tasks 의존성 기반 — Dependencies 모두 `done`인 태스크 중 ID 순 |
| **태스크별 완료 시** | plan.md Tasks 상태 → `done` + Linear Sub-issue → Done |
| **중간 커밋** | 작업 규모가 큰 경우 선택적 허용 (Conventional Commits) |
| **빌드 확인** | 태스크마다 린트 + 타입체크 + 테스트 통과 확인 |

> **갱신 원칙**: plan.md Tasks 상태 갱신. progress.txt는 ralph가 자체 관리.

---

## autopilot 위임 지시

> **적용 범위**: Deep intensity 전용

| 항목 | 지시 |
|------|------|
| **실행 관장** | autopilot이 Phase 2(Execution)부터 실행을 관장. implement는 autopilot의 실행 단계에서 호출됨 |
| **위임 방식** | autopilot → implement 호출. implement는 ralph 루프 없이 autopilot 지시에 따라 태스크 실행 |
| **완료 처리** | verify + In Review 전이는 implement §완료 조건 동일하게 수행 |

---

## Linear sub-issue 동기화

| 트리거 | 행동 |
|--------|------|
| Plan 생성 시 | plan.md Tasks 태스크별 sub-issue 생성 (best-effort. 실패 시 진행 중단 안 함) |
| 태스크 시작/완료 | sub-issue state → In Progress / Done |
| plan.md Tasks 태스크 변경 | 추가: 새 sub-issue 생성. 삭제/변경: 수동 정리 |
| 동기화 방향 | plan.md Tasks → Linear (단방향). plan.md Tasks가 SSOT |

---

## verify intensity 인식

verify 스킬 호출 시 intensity를 전달하여 검증 범위를 결정한다.

| intensity | verify 동작 |
|-----------|------------|
| **feature-Light** | plan.md Verification 수행 (plan.md 존재하므로 적용) |
| **improvement-Light** | plan.md Verification 없음 (plan.md 자체가 없으므로) |
| **improvement-Standard / Deep** | plan.md Verification 수행 |

> 이는 현재 verify의 "bug 및 improvement-light는 Verification 없음" 로직과 동일하나, 용어가 "improvement-light" → "improvement-Light (intensity)"로 통일됨.

---

## 완료 조건

| 단계 | 행위 |
|------|------|
| 4-1 | plan.md Tasks 모든 태스크 상태 = `done` 확인. **블로킹 리셋된 태스크 존재 시 pipeline.md §4-4a 대기 상태로 전환 (verify 미호출)** |
| 4-2 | 최종 빌드/테스트 통과 확인 (전체 테스트 스위트) |
| 4-3 | **verify 자동 호출**: verify 스킬 호출하여 SC + plan.md Verification 검증 수행 |
| 4-4 | verify PASS 시: 미커밋 변경사항 Git 커밋 + §In Review 출력 양식 실행 |
| 4-5 | verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → intensity별 복귀: **Light** — executor 재실행, **Standard** — ralph 루프 복귀, **Deep** — autopilot 재호출. **verify FAIL 2회 연속 시** `AskUserQuestion`으로 (a) 재시도 (b) In Review에서 사용자 수동 확인으로 전환 선택 |
| 4-6 | **OMC 잔여 상태 정리**: verify PASS 후 In Review 전이 전에 OMC 활성 상태(ralph, deep-interview, ralplan 등)를 `state_clear`로 정리. skill-active-state.json 포함 |

---

## In Review 출력 양식

verify PASS 후, Linear State → In Review 전이와 함께 아래 양식을 출력한다.

### 터미널 출력 (상세)

```
## 구현 완료 — {LINEAR-ID}

### 변경 요약
- **변경 파일**: {N}개
- **주요 변경사항**:
  - {태스크별 1줄 요약}
  - ...

### 자동 검증 결과
- [ ] 빌드: {PASS/FAIL}
- [ ] 린트: {PASS/FAIL}
- [ ] 테스트: {PASS/FAIL} ({통과}/{전체})
- [ ] verify SC: {PASS/FAIL}

### 수동 테스트 체크리스트
> plan.md Verification 기반

- [ ] {Verification 항목 1}
- [ ] {Verification 항목 2}
- [ ] ...

### 커밋
- {커밋 해시} {커밋 메시지}
```

### Linear comment (구현+검증 통합)

`linear-comment-writer` 에이전트를 호출하여 구현·검증 통합 comment를 작성하라.

**Input:**
- linear_id: {LINEAR-ID}
- comment_type: `implement-in-review`
- issue_type: {feature/improvement}
- payload:
  - summary: {핵심 변경 1줄 요약}
  - changed_files: {변경 파일 수}
  - verify_result: {verify 결과 — PASS/FAIL + SC 통과/전체, Verification 통과/전체}
  - manual_test_count: {수동 테스트 항목 수}

> 이 comment가 구현 단계의 유일한 Linear comment이다. verify에서 별도 comment를 기록하지 않음.

> **수동 테스트 항목**: plan.md Verification 섹션의 검증 조건을 사용자가 직접 확인할 수 있는 체크리스트로 변환하여 출력한다. 자동 테스트로 커버된 항목은 제외하고, 수동 확인이 필요한 항목만 포함한다.

---

## Output

| 항목 | 내용 |
|------|------|
| 코드 변경 | plan.md Tasks에 명시된 범위의 코드 + 테스트 |
| plan.md 갱신 | Tasks 상태 갱신 (ralph가 태스크 완료 직후 수행) |
| progress.txt | ralph가 자체 관리 (프레임워크 지시 불필요) |
| 커밋 | verify 완료 후 커밋. 대규모 시 중간 커밋 허용 (Conventional Commits) |
| 터미널 출력 | §In Review 출력 양식 (상세) |
| Linear comment | §In Review 출력 양식 (간략) + verify 결과 |
| Linear State | Sub-issue → Done (태스크마다) + parent Issue → In Review (verify PASS 시) |

---

## plan.md Tasks → prd.json 매핑

implement가 ralph 호출 시 plan.md Tasks를 prd.json user stories 형식으로 변환하여 전달한다. ralph는 prd.json 기반으로 실행 루프를 돌며, progress.txt에 진행 기록을 남긴다.

| plan.md 항목 | prd.json 매핑 |
|-------------|--------------|
| Task ID (T-{ID}-NN) | user story ID |
| Task 설명 | user story description |
| Dependencies | story 의존성 |
| Status | story 상태 |
| Verification 항목 | acceptance criteria |

---

## OMC 에이전트 연동

| 에이전트 | 모델 |
|---------|------|
| `oh-my-claudecode:ralph` | (자체 모델 선택) |

### 프레임워크 에이전트

| Agent | 역할 | 호출 시점 |
|-------|------|----------|
| `linear-comment-writer` | 구현·검증 통합 comment 작성 (implement-in-review) | verify PASS 후 In Review 전이 시 |

> OMC 비활성 시 micro-tasking 직접 실행 (pipeline.md §7 참조).

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Sub-issue State → Done | 태스크 완료마다 |
| 구현 완료 comment | verify PASS 시 1회 (에이전트 위임) |
| parent Issue State → In Review | verify PASS 시 |
