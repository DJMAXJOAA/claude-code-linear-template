---
name: improvement-fix
description: "improvement type Issue의 수정 프로세스 오케스트레이터. light/standard 2분할로 작업 규모에 맞는 프로세스 제공. 전 경로 Git 폴더 생성. deep-dive/deep-interview로 조사 → spec.md 산출."
---

# improvement-fix — 개선 작업 오케스트레이터

improvement type Issue의 수정 프로세스를 오케스트레이션한다. light/standard 2분할로 작업 규모에 맞는 프로세스를 제공한다.

- **light**: bug-fix 수준의 경량 프로세스. Git 폴더 생성. deep-dive로 조사 → spec.md 산출. plan.md는 인터뷰 분기(선택).
- **standard**: deep-interview → spec.md 산출 + gen-plan(ralplan 위임) 기반 프로세스. 기존 implement 스킬 재활용.

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
| 1 (G1) | **조사**: `oh-my-claudecode:deep-dive` 호출 (trace → deep-interview). Linear description + 코드베이스 컨텍스트를 input으로 전달. 산출물: `docs/issue/{LINEAR-ID}/spec.md` |
| 2 (G1) | **수정 계획 제시**: 변경 의도 + 대상 파일 목록을 사용자에게 제시 |
| 3 (G2) | **사용자 승인**: `AskUserQuestion`으로 수정 계획 확인. 승인 전 코드 수정 시작 금지 |
| 3a (G3) | **Git 폴더 생성 (미존재 시에만)**: `docs/issue/{LINEAR-ID}/` 폴더 생성. 이미 존재하면 스킵 |
| 3b (G3) | **plan.md 생성 여부 선택**: `AskUserQuestion`으로 plan.md 생성 여부 질문. 승인 시 간소화 생성 (변경 의도 + 대상 요약). 스킵 시 spec.md만 유지 |
| 4 (G3) | **Linear description 갱신**: 변경 의도 1~2줄을 description에 기록 |
| 5 (G4) | **코드 수정**: `oh-my-claudecode:ralph` 호출로 수정 구현. spec.md + plan.md(선택)를 input으로 전달. 산출물: `docs/issue/{LINEAR-ID}/prd.json`, `docs/issue/{LINEAR-ID}/progress.txt` |
| 6 (G4) | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 7 (G4) | **verify 호출**: verify 스킬로 검증 (bug-like fallback — plan.md 없으면 Linear SC 기반) |
| 8 (G4) | verify PASS 시 **커밋**: `refactor: ...` or `chore: ...` (Conventional Commits) |
| 9 (G3) | verify PASS 시: **Linear State → In Review** + 변경 요약 **Linear comment** 기록 |
| 10 | **In Review → Done**: 사용자 직접 확인 → 승인 시 **issue-close 자동 호출** (축약 경로: 검토→Done→comment→참조 문서 동기화) |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 5로 복귀

> **Git 폴더 생성**: `docs/issue/{LINEAR-ID}/` 폴더를 생성한다. spec.md는 deep-dive가 산출. plan.md는 인터뷰 분기(3b)에서 사용자 선택에 따라 생성.
> **G3**: spec.md + Linear dual-write. progress.txt Work Log에 변경 기록, Linear comment + state 갱신.

---

## Process: standard

상태 흐름: `Todo → Planning → In Progress → In Review → Done`

| 단계 | 행위 |
|------|------|
| 1 (G1) | **deep-interview 호출**: `oh-my-claudecode:deep-interview` 호출. SC, 변경 범위, 파급 분석, 접근방식을 인터뷰로 커버. 산출물: `docs/issue/{LINEAR-ID}/spec.md` |
| 3 (G1) | **plan.md + technical.md 생성**: **기존 gen-plan 스킬 호출** (ralplan 위임) |
| 5 (G2) | **Post-Plan 확인**: plan 요약 제시 → `AskUserQuestion` (바로 구현 / Q&A) |
| 6 (G3) | **Linear → In Progress** |
| 7 (G4) | **implement 호출**: plan.md Tasks 기반 micro-tasking (기존 implement 스킬 재활용, ralph 호출) |
| 8 | verify → In Review → **issue-close 자동 호출** (improvement-standard 경로: 검토→progress.txt 기록→Done→comment→미러링→환류→참조 문서 동기화) |

> standard는 **기존 gen-plan 스킬(ralplan 위임) + 기존 implement 스킬(ralph 호출)**을 사용한다.
> spec.md는 deep-interview가 산출. plan.md/technical.md는 gen-plan이 산출.
> implement 스킬을 기존 그대로 재활용한다 (plan.md Tasks 기반 micro-tasking).

---

## 에스컬레이션 / 디에스컬레이션

| 방향 | 트리거 | 타이밍 | 행동 |
|------|--------|--------|------|
| light → standard | AI 판단 또는 유저 요청 (복잡도 예상 초과) | **코드 수정 전(step 3 승인 ~ step 5 사이)에만 가능** | `AskUserQuestion`: standard 전환 제안 → 승인 시 **Linear State → Planning 전이 수행** (pipeline.md §1-4 예외 2) + Size Label `Size: light` → `Size: standard` 즉시 갱신 (`save_issue` labelIds) |
| light → (코드 수정 후 복잡) | 코드 수정 시작 후 복잡도 초과 | step 5 이후 | **새 Issue 등록** (역방향 전이 금지 원칙 준수). 기존 커밋은 유지. 기존 Issue 처리: `AskUserQuestion`으로 사용자 선택 — (a) Done(부분 완료로 기록, description에 '에스컬레이션: {새 ID}으로 계속' 추기) `(AI 권장)` (b) Canceled(미완료 중단 기록) |
| standard → feature | 아키텍처 변경 수준으로 판단 | 언제든 | `AskUserQuestion`: feature type 전환 제안 → 승인 시 새 Issue 등록 |
| bug → improvement | 기존 bug-fix complexity 전환 | 언제든 | Label 변경 → improvement-fix로 라우팅 |

> **light → standard 전환(코드 수정 전)**: In Progress → Planning 역전이 수행 (pipeline.md §1-4 예외 2). 기존 progress.txt 내용 보존 — standard 전환 시 기존 progress.txt 유지 (덮어쓰기 금지).
> **light → 복잡(코드 수정 후)**: 역방향 전이 금지 원칙에 따라 **새 Issue 등록**. 기존 커밋은 현재 Issue에 남고, 나머지 작업은 새 Issue에서 진행.
> **standard → feature 전환**: **새 Issue 등록** (역방향 전이 금지 원칙 준수).

---

## Output

### light

| 항목 | 내용 |
|------|------|
| 코드 변경 | 개선 수정 |
| Git 문서 | `docs/issue/{LINEAR-ID}/` — spec.md, plan.md(선택), prd.json, progress.txt |
| 커밋 | `refactor: ...` / `chore: ...` (Conventional Commits) |
| Linear comment | 변경 요약 |
| Linear | State → In Review (verify PASS 시) |

### standard

| 항목 | 내용 |
|------|------|
| 코드 변경 | plan.md Tasks에 명시된 범위의 코드 + 테스트 |
| Git 문서 | `docs/issue/{LINEAR-ID}/` — spec.md, plan.md, technical.md, prd.json, progress.txt |
| 커밋 | Conventional Commits (verify 완료 후 + 대규모 시 중간 커밋) |
| Linear comment | verify 완료 후 1회 |
| Linear | Sub-issue 상태 Done + parent Issue State 전이 |

---

## OMC 에이전트 연동

| size | 단계 | 에이전트 | 모델 |
|------|------|---------|------|
| light | 조사 (trace + deep-interview) | `oh-my-claudecode:deep-dive` | deep-dive 내부 라우팅 |
| light | 코드 수정 | `oh-my-claudecode:ralph` | ralph 내부 라우팅 |
| light | 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |
| standard | 요구사항 인터뷰 | `oh-my-claudecode:deep-interview` | deep-interview 내부 라우팅 |
| standard | 계획 생성 | gen-plan 스킬 → `oh-my-claudecode:ralplan` | ralplan 내부 라우팅 |
| standard | 구현 | implement 스킬 → `oh-my-claudecode:ralph` | ralph 내부 라우팅 |
| standard | 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |

> OMC 비활성 시 fallback:
> - light: deep-dive 비활성 → `oh-my-claudecode:explore`(haiku)로 대체. ralph 비활성 → `oh-my-claudecode:executor`(sonnet)로 대체.
> - standard: deep-interview 비활성 → 기존 4항목 인터뷰 (SC, 변경 범위, 파급 분석, 접근방식) `AskUserQuestion`으로 직접 수행. ralplan 비활성 → Post-Plan Q/A로 대체. ralph 비활성 → `oh-my-claudecode:executor`(sonnet)로 대체.
> 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | size | 상세 |
|------|------|------|
| Issue description에서 SC/Change Scope 조회 | 공통 | 수정 시작 전 1회 |
| Size Label 부착 (`Size: light` / `Size: standard`) | 공통 | dev-pipeline에서 판별 후 Label 부착 |
| description 변경 의도 기록 | light | G3 단계 |
| State → In Review 전이 | light | verify PASS 시 |
| 변경 요약 comment | light | verify PASS 후 |
| State → Planning 전이 | standard | deep-interview 시작 전 |
| State → Planning 전이 (에스컬레이션) | light→standard | 전환 승인 시 |
| Size Label 갱신 | light→standard | 전환 승인 시 `Size: light` → `Size: standard` Label 교체 |
| State → In Progress 전이 | standard | Post-Plan 후 |
| Sub-issue 동기화 | standard | implement 스킬 위임 |
| verify 결과 comment | standard | implement 완료 후 |
