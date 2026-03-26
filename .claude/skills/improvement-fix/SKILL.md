---
name: improvement-fix
description: "improvement type Issue의 수정 프로세스 오케스트레이터. light/standard 2분할로 작업 규모에 맞는 프로세스 제공."
disable-model-invocation: true
---

# improvement-fix — 개선 작업 오케스트레이터

improvement type Issue의 수정 프로세스를 오케스트레이션한다. light/standard 2분할로 작업 규모에 맞는 프로세스를 제공한다.

- **light**: bug-fix 수준의 경량 프로세스. CL/plan 없이 직접 수정. Git 문서 미생성.
- **standard**: 간소화된 plan/cl 기반 프로세스. 기존 gen-plan 스킬 + implement 스킬 재활용.

## Trigger

- dev-pipeline에서 improvement type Issue의 size 판별 완료 후 호출
- `/활성화`에서 improvement type Issue가 In Progress 상태일 때 재개 (light: 직접 재개, standard: implement 재개)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, Change Scope, Success Criteria) |
| size | `light` / `standard` — dev-pipeline에서 판별하여 전달 |

---

## Process: light

상태 흐름: `Todo → In Progress → In Review → Done` (bug와 동일)

| 단계 | 행위 |
|------|------|
| 1 (G1) | **탐색**: `oh-my-claudecode:explore` 에이전트로 변경 대상 파일/모듈 식별 |
| 2 (G1) | **수정 계획 제시**: 변경 의도 + 대상 파일 목록을 사용자에게 제시 |
| 3 (G2) | **사용자 승인**: `AskUserQuestion`으로 수정 계획 확인. 승인 전 코드 수정 시작 금지 |
| 4 (G3) | **Linear description 갱신**: 변경 의도 1~2줄을 description에 기록 |
| 5 (G4) | **코드 수정**: `oh-my-claudecode:executor` 에이전트로 수정 구현 |
| 6 (G4) | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 7 (G4) | **커밋**: `refactor: ...` or `chore: ...` (Conventional Commits) |
| 8 (G4) | **verify 호출**: verify 스킬로 검증 (bug-like fallback — cl.md 없이 Linear SC 기반) |
| 9 (G3) | verify PASS 시: **Linear State → In Review** + 변경 요약 **Linear comment** 기록 |
| 10 | **In Review → Done**: 사용자 직접 확인 → 승인 시 **issue-close 자동 호출** (축약 경로: 검토→Done→comment→참조 문서 동기화) |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 5로 복귀

> **Git 문서 미생성**: `docs/issue/`, `_index.md`, `plan.md`, `cl.md` 생성하지 않는다. 모든 기록은 Linear description + comment로 관리.
> **G3 예외**: light는 bug-fix 선례와 동일하게 **Linear-only write** (comment + state). Git 문서가 없으므로 dual-write 중 Git 측은 커밋으로 대체.

---

## Process: standard

상태 흐름: `Todo → Planning → In Progress → In Review → Done`

| 단계 | 행위 |
|------|------|
| 1 (G1) | **Pre-Plan 인터뷰** (4항목): SC, 변경 범위, 파급 분석, 접근방식. `AskUserQuestion`으로 각 항목 확인 |
| 2 (G1) | **코드베이스 조사**: `oh-my-claudecode:explore` 에이전트로 영향 범위 탐색 |
| 3 (G1) | **plan.md + cl.md 생성**: **기존 gen-plan 스킬 호출** (기존 템플릿 그대로 사용) |
| 4 (G1) | **_index.md 생성**: gen-hub 템플릿 참조 |
| 5 (G2) | **Post-Plan 확인**: plan 요약 제시 → `AskUserQuestion` (바로 구현 / Q&A / AI 리뷰) |
| 6 (G3) | **Linear → In Progress** |
| 7 (G4) | **implement 호출**: CL S1 기반 micro-tasking (기존 implement 스킬 재활용) |
| 8 | verify → In Review → **issue-close 자동 호출** (improvement-standard 경로: 검토→_index.md 기록→Done→comment→미러링→환류→참조 문서 동기화) |

> standard는 **기존 gen-plan 스킬 + 기존 템플릿**을 그대로 사용한다.
> plan.md/cl.md는 "AI 작업 지침서"이므로 feature와 동일 구조가 적합.
> implement 스킬을 기존 그대로 재활용한다 (CL 기반 micro-tasking).

---

## 에스컬레이션 / 디에스컬레이션

| 방향 | 트리거 | 타이밍 | 행동 |
|------|--------|--------|------|
| light → standard | AI 판단 또는 유저 요청 (복잡도 예상 초과) | **코드 수정 전(step 3 승인 ~ step 5 사이)에만 가능** | `AskUserQuestion`: standard 전환 제안 → 승인 시 Planning 진입 |
| light → (코드 수정 후 복잡) | 코드 수정 시작 후 복잡도 초과 | step 5 이후 | **새 Issue 등록** (역방향 전이 금지 원칙 준수). 기존 커밋은 유지 |
| standard → feature | 아키텍처 변경 수준으로 판단 | 언제든 | `AskUserQuestion`: feature type 전환 제안 → 승인 시 새 Issue 등록 |
| bug → improvement | 기존 bug-fix complexity 전환 | 언제든 | Label 변경 → improvement-fix로 라우팅 |

> **light → standard 전환(코드 수정 전)**: In Progress 내에서 Planning 진입 (역방향 전이 예외). pipeline.md §1-4 예외 목록 참조.
> **light → 복잡(코드 수정 후)**: 역방향 전이 금지 원칙에 따라 **새 Issue 등록**. 기존 커밋은 현재 Issue에 남고, 나머지 작업은 새 Issue에서 진행.
> **standard → feature 전환**: **새 Issue 등록** (역방향 전이 금지 원칙 준수).

---

## Output

### light

| 항목 | 내용 |
|------|------|
| 코드 변경 | 개선 수정 |
| 커밋 | `refactor: ...` / `chore: ...` (Conventional Commits) |
| Linear comment | 변경 요약 |
| Linear | State → In Review (verify PASS 시) |

> Git 문서(`docs/issue/`, `_index.md`)는 생성하지 않는다. 모든 기록은 Linear comment + description으로 관리.

### standard

| 항목 | 내용 |
|------|------|
| 코드 변경 | CL S1 태스크에 명시된 범위의 코드 + 테스트 |
| Git 문서 | `docs/issue/{LINEAR-ID}/` — _index.md, plan.md, cl.md |
| 커밋 | Conventional Commits (verify 완료 후 + 대규모 시 중간 커밋) |
| Linear comment | verify 완료 후 1회 |
| Linear | Sub-issue 상태 Done + parent Issue State 전이 |

---

## OMC 에이전트 연동

| size | 단계 | 에이전트 | 모델 |
|------|------|---------|------|
| light | 탐색 | `oh-my-claudecode:explore` | haiku |
| light | 코드 수정 | `oh-my-claudecode:executor` | sonnet |
| light | 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |
| standard | 코드베이스 조사 | `oh-my-claudecode:explore` | haiku |
| standard | Post-Plan 합의 리뷰 (R1) | `oh-my-claudecode:architect` | opus |
| standard | Post-Plan 합의 리뷰 (R2) | `oh-my-claudecode:critic` | opus |
| standard | 구현 | implement 스킬 → `oh-my-claudecode:executor` | sonnet |
| standard | 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | size | 상세 |
|------|------|------|
| Issue description에서 SC/Change Scope 조회 | 공통 | 수정 시작 전 1회 |
| description Overview `Size` 행 기록 | 공통 | dev-pipeline에서 판별 후 기록 |
| description 변경 의도 기록 | light | G3 단계 |
| State → In Review 전이 | light | verify PASS 시 |
| 변경 요약 comment | light | verify PASS 후 |
| State → Planning 전이 | standard | Pre-Plan Q/A 시작 전 |
| State → In Progress 전이 | standard | Post-Plan 후 |
| Sub-issue 동기화 | standard | implement 스킬 위임 |
| verify 결과 comment | standard | implement 완료 후 |
