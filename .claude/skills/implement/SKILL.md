---
name: implement
description: "plan.md Tasks 기준 Micro-tasking 오케스트레이터. dev-pipeline에서 In Progress 단계 진입 시 호출. note.md Work Log + Handoff 병행 갱신."
---

# implement — Micro-tasking 오케스트레이터

plan.md Tasks를 `oh-my-claudecode:ralph` 루프로 자동 실행한다.
인터뷰 없이 즉시 시작. ralph가 태스크 선택 → 코드 구현 → 빌드 검증 → 문서 갱신을 반복하고, 완료 후 verify → In Review 전이까지 수행한다.

## Trigger

- dev-pipeline에서 In Progress 단계 진입 시 (feature / improvement-standard)
- `/활성화`에서 In Progress 상태 재개 시

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` — Tasks 목록 + Verification (검증 조건) |
| note.md | `docs/issue/{LINEAR-ID}/note.md` — Work Log + Handoff |
| prd.md | `docs/issue/{LINEAR-ID}/prd.md` — 요구사항 참조 (필요 시에만 읽기) |
| type | `feature` / `improvement` (standard) — bug 및 improvement-light는 implement를 사용하지 않음 |

---

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **plan.md Tasks 상태 확인**: 모든 태스크가 `done`이면 → §완료 조건으로 직행 |
| 2 (G4) | **ralph 루프 실행**: `oh-my-claudecode:ralph`로 plan.md Tasks 전체 자동 실행 |

> ralph 호출 시 아래 §ralph 위임 지시를 프롬프트에 포함한다.

---

## ralph 위임 지시

implement가 ralph에게 전달하는 실행 지침:

| 항목 | 지시 |
|------|------|
| **태스크 순서** | plan.md Tasks 의존성 기반 — Dependencies 모두 `done`인 태스크 중 ID 순 |
| **태스크별 완료 시** | plan.md Tasks 상태 → `done` + note.md Work Log 1줄 append + Linear Sub-issue → Done |
| **배치 완료 시** | note.md Handoff 섹션 덮어쓰기 (현재 진행 상태 요약) |
| **중간 커밋** | 작업 규모가 큰 경우 선택적 허용 (Conventional Commits) |
| **빌드 확인** | 태스크마다 린트 + 타입체크 + 테스트 통과 확인 |

> **갱신 원칙**: plan.md Tasks 상태 갱신과 note.md Work Log append는 항상 병행 수행. 둘 중 하나만 갱신하는 부분 실행 금지.

---

## Linear sub-issue 동기화

| 트리거 | 행동 |
|--------|------|
| Plan 생성 시 | plan.md Tasks 태스크별 sub-issue 생성 (best-effort. 실패 시 진행 중단 안 함) |
| 태스크 시작/완료 | sub-issue state → In Progress / Done |
| plan.md Tasks 태스크 변경 | 추가: 새 sub-issue 생성. 삭제/변경: 수동 정리 |
| 동기화 방향 | plan.md Tasks → Linear (단방향). plan.md Tasks가 SSOT |

---

## 완료 조건

| 단계 | 행위 |
|------|------|
| 4-1 | plan.md Tasks 모든 태스크 상태 = `done` 확인. **블로킹 리셋된 태스크 존재 시 pipeline.md §4-4a 대기 상태로 전환 (verify 미호출)** |
| 4-2 | 최종 빌드/테스트 통과 확인 (전체 테스트 스위트) |
| 4-3 | **verify 자동 호출**: verify 스킬 호출하여 SC + plan.md Verification 검증 수행 |
| 4-4 | verify PASS 시: 미커밋 변경사항 Git 커밋 + §In Review 출력 양식 실행 |
| 4-5 | verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → ralph 루프로 복귀 |

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

### Linear comment (간략)

```
구현 완료 → In Review

변경 파일 {N}개. 주요: {핵심 변경 1줄 요약}.
verify PASS. 수동 테스트 {M}개 항목 확인 필요.
```

> **수동 테스트 항목**: plan.md Verification 섹션의 검증 조건을 사용자가 직접 확인할 수 있는 체크리스트로 변환하여 출력한다. 자동 테스트로 커버된 항목은 제외하고, 수동 확인이 필요한 항목만 포함한다.

---

## Output

| 항목 | 내용 |
|------|------|
| 코드 변경 | plan.md Tasks에 명시된 범위의 코드 + 테스트 |
| plan.md 갱신 | Tasks 상태 갱신 (ralph가 태스크 완료 직후 수행) |
| note.md 갱신 | Work Log append + Handoff 덮어쓰기 (ralph가 수행) |
| 커밋 | verify 완료 후 커밋. 대규모 시 중간 커밋 허용 (Conventional Commits) |
| 터미널 출력 | §In Review 출력 양식 (상세) |
| Linear comment | §In Review 출력 양식 (간략) + verify 결과 |
| Linear State | Sub-issue → Done (태스크마다) + parent Issue → In Review (verify PASS 시) |

---

## OMC 에이전트 연동

| 에이전트 | 모델 |
|---------|------|
| `oh-my-claudecode:ralph` | (자체 모델 선택) |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Sub-issue State → Done | 태스크 완료마다 |
| 구현 완료 comment | verify PASS 시 1회 (§In Review 출력 양식 간략) |
| parent Issue State → In Review | verify PASS 시 |
