---
name: bug-fix
description: "bug type Issue의 수정 프로세스 오케스트레이터. 2단계 intensity(Light/Deep) 기반 버그 수정 프로세스. Git 문서 미생성 — Linear comment로 로그."
---

# bug-fix — 버그 수정 오케스트레이터

bug type Issue의 수정 프로세스를 오케스트레이션한다. dev-pipeline에서 선택된 intensity(Light/Deep)에 따라 에이전트 체인을 실행한다. Git 문서(spec.md, prd.json, progress.txt)를 생성하지 않으며, Linear comment로 로그를 남긴다.

## Trigger

- dev-pipeline에서 bug type Issue의 In Progress 단계 진입 시 (intensity 결정 완료 상태)
- `/활성화`에서 bug type Issue가 In Progress 상태일 때 재개

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Summary, Success Criteria) — `linear_payload` 전달 시 해당 정보 사용 (Linear MCP 조회 스킵). 미전달 시 Linear MCP로 직접 조회 |
| Intensity | `Light` 또는 `Deep` — dev-pipeline에서 결정됨 |

## Intensity 기반 프로세스 분기

Intensity는 dev-pipeline에서 이미 선택된다. 이 스킬에서 AskUserQuestion으로 재선택하지 않는다.

### 기존 패턴 → Intensity 매핑

| 기존 패턴 | 새 Intensity | 근거 |
|-----------|-------------|------|
| 기본 (basic) | Light | 원인 파악, 표준 수정 흐름 |
| 경량 (lightweight) | Light | 단순 수정, 최소 조사 |
| 원인불명 (unknown cause) | Deep | trace 기반 심층 조사 필요 |

### Light Chain

`debugger`(원인 파악) → `plan(터미널)`(수정 계획 출력) → `executor`(수정) → `verify`(검증)

- `plan(터미널)` = 실행 전 터미널에 수정 계획 간략 출력 (Git 문서 아님)
- Git 문서 미생성. Linear comment로만 로그 기록

### Deep Chain

`trace(skill)`(심층 조사) → `debugger`(근본 원인 분석) → `architect`(설계 검토) → `executor`(수정) → `qa-tester`(선택) → `verify`(검증)

- `trace` = `oh-my-claudecode:trace` skill — evidence-driven 심층 조사
- Git 문서 미생성. Linear structured comment로 로그 기록 (아래 §Structured Comment 템플릿 참조)
- `qa-tester`는 선택적 (사용자 확인 필요 시)

### Deep — Linear Structured Comment 템플릿

`.claude/templates/comment-formats.md`의 `completion-deep` 형식을 SSOT로 참조한다. `linear-comment-writer` 에이전트가 해당 형식을 적용.

---

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **원인 조사**: intensity별 에이전트 체인으로 조사 실행 (§Intensity 기반 프로세스 분기 참조) |
| 2 (G1) | **수정 계획 제시**: Root Cause + 수정 방안을 사용자에게 제시 |
| 3 (G2) | **사용자 승인**: `AskUserQuestion`으로 수정 계획 확인. 승인 전 코드 수정 시작 금지 |
| 4 (G3) | **Linear comment 기록**: `linear-comment-writer` 에이전트를 호출하여 조사 완료 코멘트를 작성하라. Input: linear_id={LINEAR-ID}, comment_type=investigation, issue_type=bug, intensity={light/deep}, payload={root_cause, reproduction(Deep), impact_scope(Deep), fix_plan(Deep)} |
| 5 (G4) | **코드 수정**: intensity별 에이전트 체인으로 수정 구현 |
| 6 (G4) | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 7 (G4) | **verify 자동 호출**: verify 스킬로 Success Criteria 검증 |
| 8 (G4) | verify PASS 시 **커밋**: `fix: ...` (Conventional Commits) |
| 9 (G3) | verify PASS 시: **Linear State → In Review** + `linear-comment-writer` 에이전트를 호출하여 완료 코멘트를 작성하라. Input: linear_id={LINEAR-ID}, comment_type=completion-light (Light) 또는 completion-deep (Deep), issue_type=bug, intensity={light/deep}, payload={수정 요약, Root Cause(Deep)} |
| 10 | **In Review → Done**: 사용자 직접 확인 → 승인 시 **issue-close 자동 호출** |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 5로 복귀. **verify FAIL 2회 연속 시** `AskUserQuestion`으로 (a) 재시도 (b) improvement type 전환 (c) In Review에서 사용자 수동 확인으로 전환 선택.

---

## 로그 전략

Git 문서 대신 **Linear comment**로 전 과정을 기록한다.

### Light

| 시점 | comment_type |
|------|-------------|
| 조사 완료 후 | `investigation` (intensity=light) |
| 구현·검증 완료 후 | `completion-light` |

### Deep

| 시점 | comment_type |
|------|-------------|
| 조사 완료 후 | `investigation` (intensity=deep) |
| 구현·검증 완료 후 | `completion-deep` |

> 형식은 `.claude/templates/comment-formats.md` 참조. `linear-comment-writer` 에이전트가 적용.

> Git 폴더(`docs/issue/{ID}/`)를 생성하지 않는다. Light·Deep 모두 동일. 코드 변경은 git commit(`fix: ...`)으로 기록.

---

## Output

| 항목 | Light | Deep |
|------|-------|------|
| Git 문서 | 없음 | 없음 |
| 코드 변경 | 버그 수정 + 테스트 | 버그 수정 + 테스트 |
| 커밋 | `fix: ...` (Conventional Commits) | `fix: ...` (Conventional Commits) |
| Linear 로그 | Linear comment (2회) | Linear structured comment (2회) |
| Linear | State → In Review (verify PASS 시) | State → In Review (verify PASS 시) |

---

## complexity 전환

| 조건 | 행동 |
|------|------|
| 복잡한 버그로 판단 | `AskUserQuestion`으로 사용자에게 improvement type 전환 제안 |
| 전환 승인 시 | Linear Label을 `improvement`로 변경 → Plan → implement 경로 사용 |
| 판단 기준 | 수정 대상 파일 3개 이상, 모듈 간 영향, 설계 변경 필요 시 |

---

## OMC 에이전트 연동

### 프레임워크 에이전트

| Agent | 역할 | 호출 시점 |
|-------|------|----------|
| `linear-comment-writer` | 조사/완료 comment 작성 | 단계 4, 9 (G3) |

| Intensity | 에이전트 | 모델 |
|-----------|---------|------|
| Light | `oh-my-claudecode:debugger` | sonnet |
| Light | `oh-my-claudecode:executor` | sonnet |
| Light | `oh-my-claudecode:verify` | sonnet |
| Deep | `oh-my-claudecode:trace` | sonnet |
| Deep | `oh-my-claudecode:debugger` | sonnet |
| Deep | `oh-my-claudecode:architect` | opus |
| Deep | `oh-my-claudecode:executor` | sonnet |
| Deep | `oh-my-claudecode:qa-tester` (선택) | sonnet |
| Deep | `oh-my-claudecode:verify` | sonnet |

> OMC 비활성 시: pipeline.md §7 참조.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description에서 SC 조회 | 수정 시작 전 1회 |
| 조사 완료 comment | 조사 완료 후 — intensity + Root Cause 요약 (에이전트 위임) |
| 구현·검증 완료 comment | verify PASS 후 — fix 요약 (에이전트 위임) |
| State → In Review 전이 | verify PASS 시 |
