---
name: improvement-fix
description: "improvement type Issue의 수정 프로세스 오케스트레이터. intensity 기반 3단계 프로세스 (Light/Standard/Deep)로 작업 강도에 맞는 프로세스 제공."
---

# improvement-fix — 개선 작업 오케스트레이터

improvement type Issue의 수정 프로세스를 오케스트레이션한다. intensity 기반 3단계 프로세스(Light/Standard/Deep)로 작업 강도에 맞는 프로세스를 제공한다.

- **Light**: bug-fix 수준의 경량 프로세스. Git 폴더 미생성. plan(터미널)으로 간략 출력 후 executor 실행. verify 후 simplify(skill)로 마무리.
- **Standard**: Git 폴더 생성. plan → architect 검토 → executor 실행. verify 후 simplify(skill)로 마무리.
- **Deep**: 보안 리뷰 포함 풀 파이프라인. deep-interview → ralplan → autopilot. Git 폴더 생성 (spec.md + plan.md + technical.md).

## Trigger

- dev-pipeline에서 improvement type Issue의 intensity 판별 완료 후 호출
- `/활성화`에서 improvement type Issue가 In Progress 상태일 때 재개 (Light: 직접 재개, Standard/Deep: implement 재개)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, Change Scope, Success Criteria) |
| intensity | `Light` / `Standard` / `Deep` — dev-pipeline에서 판별하여 전달 |

---

## Process: Light

상태 흐름: `Todo → In Progress → In Review → Done` (bug와 동일)

Agent chain: `code-reviewer → plan(터미널) → executor → verify → simplify(skill)`

| 단계 | 행위 |
|------|------|
| 1 (G1) | **code-reviewer**: `oh-my-claudecode:code-reviewer` 호출. Linear description + 코드베이스 컨텍스트를 input으로 전달. 리뷰 결과를 수정 방향에 반영 |
| 2 (G1) | **plan(터미널)**: 수정 계획을 터미널에 간략 출력 (Git 문서 아님). 변경 의도 + 대상 파일 목록 포함 |
| 3 (G2) | **사용자 승인**: `AskUserQuestion`으로 수정 계획 확인. 승인 전 코드 수정 시작 금지 |
| 4 (G3) | **Linear description 갱신**: 변경 의도 1~2줄을 description에 기록 |
| 5 (G4) | **코드 수정**: `oh-my-claudecode:executor` 호출로 수정 구현 |
| 6 (G4) | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 7 (G4) | **verify 호출**: verify 스킬로 검증 (bug-like fallback — Linear SC 기반) |
| 8 (G4) | verify PASS 시 **simplify(skill)**: `oh-my-claudecode:simplify` 호출로 최종 정리 |
| 9 (G4) | **커밋**: `refactor: ...` or `chore: ...` (Conventional Commits) |
| 10 (G3) | verify PASS 시: **Linear State → In Review** + 변경 요약 **Linear comment** 기록 |
| 11 | **In Review → Done**: 사용자 직접 확인 → 승인 시 **issue-close 자동 호출** |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 5로 복귀
>
> **Git 폴더 미생성**: Light는 spec.md, plan.md, Git 폴더를 생성하지 않는다. Linear comment로 로그를 남긴다.
> **plan(터미널)**: 실행 전 터미널에 수정 계획 간략 출력만 (Git 문서 아님).
> **simplify(skill)**: verify 후 마지막 정리 단계. `oh-my-claudecode:simplify` 호출.

---

## Process: Standard

상태 흐름: `Todo → Planning → In Progress → In Review → Done`

Agent chain: `code-reviewer → plan → architect → executor → verify → simplify(skill)`

| 단계 | 행위 |
|------|------|
| 0 (G3) | **Linear State → Planning 전이**: 프로세스 시작 전 즉시 수행 |
| 1 (G1) | **code-reviewer**: `oh-my-claudecode:code-reviewer` 호출. Linear description + 코드베이스 컨텍스트를 input으로 전달. 리뷰 결과를 수정 방향에 반영 |
| 2 (G1) | **plan + technical**: `docs/issue/{LINEAR-ID}/plan.md` + `docs/issue/{LINEAR-ID}/technical.md` 생성 (Git 문서). 변경 의도 + 대상 파일 + 태스크 목록 포함 |
| 3 (G1) | **spec.md 생성**: `docs/issue/{LINEAR-ID}/spec.md` 생성 |
| 4 (G1) | **Git 폴더 생성 (미존재 시에만)**: `docs/issue/{LINEAR-ID}/` 폴더 생성. 이미 존재하면 스킵 |
| 5 (G1) | **architect 검토**: `oh-my-claudecode:architect` 호출. plan.md 기반 설계 검토. 피드백을 plan.md에 반영 |
| 6 (G2) | **Post-Plan 확인**: plan 요약 제시 → `AskUserQuestion` (바로 구현 / Q&A) |
| 7 (G3) | **Linear description 갱신** + **State 유지 (In Progress)** |
| 8 (G4) | **코드 수정**: `oh-my-claudecode:executor` 호출. plan.md Tasks 기반 micro-tasking |
| 9 (G4) | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 10 (G4) | **verify 호출**: verify 스킬로 검증 (plan.md Verification 기반) |
| 11 (G4) | verify PASS 시 **simplify(skill)**: `oh-my-claudecode:simplify` 호출로 최종 정리 |
| 12 (G4) | **커밋**: Conventional Commits (verify 완료 후 + 대규모 시 중간 커밋) |
| 13 | verify → **Linear State → In Review** → **issue-close 자동 호출** |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 8로 복귀
>
> **plan + technical = Git 문서**: `docs/issue/{LINEAR-ID}/plan.md` + `docs/issue/{LINEAR-ID}/technical.md`로 저장.
> **simplify(skill)**: verify 후 마지막 정리 단계. `oh-my-claudecode:simplify` 호출.

---

## Process: Deep

상태 흐름: `Todo → Planning → In Progress → In Review → Done`

Agent chain: `code-reviewer + security-reviewer → deep-interview(skill) → ralplan(--deliberate) → autopilot → verify`

| 단계 | 행위 |
|------|------|
| 1 (G1) | **code-reviewer + security-reviewer 병렬**: `oh-my-claudecode:code-reviewer` + `oh-my-claudecode:security-reviewer` 동시 호출. 리뷰 결과 통합 |
| 2 (G1) | **deep-interview(skill)**: `oh-my-claudecode:deep-interview` 호출. SC, 변경 범위, 파급 분석, 보안 영향, 접근방식을 인터뷰로 커버. 산출물: `docs/issue/{LINEAR-ID}/spec.md` |
| 3 (G1) | **Git 폴더 생성 (미존재 시에만)**: `docs/issue/{LINEAR-ID}/` 폴더 생성 |
| 4 (G1) | **ralplan(--deliberate)**: `oh-my-claudecode:ralplan` 호출 (--deliberate 옵션). 산출물: `docs/issue/{LINEAR-ID}/plan.md` + `docs/issue/{LINEAR-ID}/technical.md` |
| 5 (G2) | **Post-Plan 확인**: plan 요약 + 보안 검토 결과 제시 → `AskUserQuestion` (바로 구현 / Q&A) |
| 6 (G3) | **Linear State → In Progress** + description 갱신 |
| 7 (G4) | **autopilot**: `oh-my-claudecode:autopilot` 호출. plan.md Tasks 기반 전체 구현 |
| 8 (G4) | **verify 호출**: verify 스킬로 검증 (plan.md Verification + SC 기반) |
| 9 (G4) | **커밋**: Conventional Commits (verify 완료 후 + 대규모 시 중간 커밋) |
| 10 | verify → **Linear State → In Review** → **issue-close 자동 호출** |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 7로 복귀
>
> **Git 폴더 생성**: spec.md + plan.md + technical.md 전체 생성.
> **simplify(skill) 없음**: Deep은 autopilot 내부에서 처리.

---

## 에스컬레이션

| 방향 | 트리거 | 타이밍 | 행동 |
|------|--------|--------|------|
| Light → Standard | AI 판단 또는 유저 요청 (복잡도 예상 초과) | **코드 수정 전에만 가능** | `AskUserQuestion`: Standard 전환 제안 → 승인 시 `Intensity: Light` → `Intensity: Standard` Label 즉시 갱신 (`save_issue` labelIds) + **Linear State → Planning 역전이 수행** (pipeline.md §1-4 예외 2) + **Git 폴더 미존재 시 `docs/issue/{LINEAR-ID}/` 폴더 생성 + Linear description Documents 갱신** |
| Standard → Deep | AI 판단 또는 유저 요청 (보안·아키텍처 이슈) | **구현 시작 전에만 가능** | `AskUserQuestion`: Deep 전환 제안 → 승인 시 `Intensity: Standard` → `Intensity: Deep` Label 즉시 갱신 (`save_issue` labelIds) |
| Light → Deep | **불가** | — | Light는 반드시 Standard를 경유해야 함. Light → Deep 직접 전환 금지 |
| Light → 새 Issue | 코드 수정 시작 후 복잡도 초과 | step 5 이후 | **새 Issue 등록** (역방향 전이 금지 원칙 준수). 기존 커밋 유지. 기존 Issue 처리: `AskUserQuestion` — (a) Done(부분 완료 기록, description에 '에스컬레이션: {새 ID}으로 계속' 추기) `(AI 권장)` (b) Canceled(미완료 중단 기록) |
| Standard → feature | 아키텍처 변경 수준으로 판단 | 언제든 | `AskUserQuestion`: feature type 전환 제안 → 승인 시 새 Issue 등록 |

> **Light → Standard 전환(코드 수정 전)**: In Progress → Planning 역전이 수행 (pipeline.md §1-4 예외 2). 기존 terminal plan 폐기 → Planning에서 plan.md 새로 생성. 기존 progress.txt 내용 보존 — 전환 시 기존 progress.txt 유지 (덮어쓰기 금지).
> **Light → 복잡(코드 수정 후)**: 역방향 전이 금지 원칙에 따라 **새 Issue 등록**. 기존 커밋은 현재 Issue에 남고, 나머지 작업은 새 Issue에서 진행.
> **Standard → Deep 전환**: 구현 시작 전에만 가능. 구현 시작 후에는 새 Issue 등록.
> **모든 Label 변경**: Linear MCP `save_issue` labelIds로 수행.

---

## Output

### Light

| 항목 | 내용 |
|------|------|
| 코드 변경 | 개선 수정 |
| Git 문서 | 없음 (spec.md, plan.md, Git 폴더 미생성) |
| 커밋 | `refactor: ...` / `chore: ...` (Conventional Commits) |
| Linear comment | 변경 요약 |
| Linear | State → In Review (verify PASS 시) |

### Standard

| 항목 | 내용 |
|------|------|
| 코드 변경 | plan.md Tasks에 명시된 범위의 코드 + 테스트 |
| Git 문서 | `docs/issue/{LINEAR-ID}/` — spec.md, plan.md, technical.md, prd.json, progress.txt |
| 커밋 | Conventional Commits (verify 완료 후 + 대규모 시 중간 커밋) |
| Linear comment | verify 완료 후 1회 |
| Linear | State → In Review (verify PASS 시) |

### Deep

| 항목 | 내용 |
|------|------|
| 코드 변경 | plan.md Tasks에 명시된 전체 범위의 코드 + 테스트 |
| Git 문서 | `docs/issue/{LINEAR-ID}/` — spec.md, plan.md, technical.md, prd.json, progress.txt |
| 커밋 | Conventional Commits (verify 완료 후 + 대규모 시 중간 커밋) |
| Linear comment | verify 완료 후 1회 + 보안 검토 결과 |
| Linear | Sub-issue 상태 Done + parent Issue State 전이 |

---

## OMC 에이전트 연동

| intensity | 단계 | 에이전트 | 모델 |
|-----------|------|---------|------|
| Light | 코드 리뷰 | `oh-my-claudecode:code-reviewer` | sonnet |
| Light | 코드 수정 | `oh-my-claudecode:executor` | sonnet |
| Light | 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |
| Light | 최종 정리 | `oh-my-claudecode:simplify` | sonnet |
| Standard | 코드 리뷰 | `oh-my-claudecode:code-reviewer` | sonnet |
| Standard | 설계 검토 | `oh-my-claudecode:architect` | opus |
| Standard | 코드 수정 | `oh-my-claudecode:executor` | sonnet |
| Standard | 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |
| Standard | 최종 정리 | `oh-my-claudecode:simplify` | sonnet |
| Deep | 코드 리뷰 | `oh-my-claudecode:code-reviewer` | sonnet |
| Deep | 보안 리뷰 | `oh-my-claudecode:security-reviewer` | opus |
| Deep | 요구사항 인터뷰 | `oh-my-claudecode:deep-interview` | deep-interview 내부 라우팅 |
| Deep | 계획 생성 | `oh-my-claudecode:ralplan` (--deliberate) | ralplan 내부 라우팅 |
| Deep | 구현 | `oh-my-claudecode:autopilot` | autopilot 내부 라우팅 |
| Deep | 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |

> OMC 비활성 시 fallback:
> - Light: executor 비활성 → sonnet 직접 수행. code-reviewer 비활성 → 자체 리뷰 수행. simplify 비활성 → 수동 정리.
> - Standard: architect 비활성 → Post-Plan Q/A로 대체. executor 비활성 → sonnet 직접 수행. simplify 비활성 → 수동 정리.
> - Deep: security-reviewer 비활성 → 보안 체크리스트 수동 수행 + 사용자 알림. deep-interview 비활성 → 4항목 인터뷰 `AskUserQuestion` 직접 수행. ralplan 비활성 → Post-Plan Q/A로 대체. autopilot 비활성 → `oh-my-claudecode:ralph`로 대체.
> 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | intensity | 상세 |
|------|-----------|------|
| Issue description에서 SC/Change Scope 조회 | 공통 | 수정 시작 전 1회 |
| Intensity Label 부착 (`Intensity: Light` / `Intensity: Standard` / `Intensity: Deep`) | 공통 | dev-pipeline에서 판별 후 Label 부착 |
| description 변경 의도 기록 | Light | G3 단계 |
| State → In Review 전이 | Light | verify PASS 시 |
| 변경 요약 comment | Light | verify PASS 후 |
| State → Planning 전이 | Standard, Deep | 프로세스 시작 전 |
| State → Planning 전이 (에스컬레이션) | Light→Standard | 전환 승인 시 |
| Intensity Label 갱신 | 에스컬레이션 시 | 전환 승인 시 `save_issue` labelIds로 교체 |
| State → In Progress 전이 | Standard, Deep | Post-Plan 후 |
| verify 결과 comment | Standard, Deep | 구현 완료 후 |
| Sub-issue 동기화 | Deep | autopilot 내부 처리 |
