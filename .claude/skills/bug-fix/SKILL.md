---
name: bug-fix
description: "bug type Issue의 수정 프로세스 오케스트레이터. 작업 규모별 3패턴 분류(기본/경량/원인불명) 후 에이전트 체인 실행. Git 문서 미생성 — Linear comment로 로그."
---

# bug-fix — 버그 수정 오케스트레이터

bug type Issue의 수정 프로세스를 오케스트레이션한다. 작업 규모에 따라 3가지 패턴으로 분류하고, 각 패턴에 맞는 에이전트 체인을 실행한다. Git 문서(spec.md, prd.json, progress.txt)를 생성하지 않으며, Linear comment로 로그를 남긴다.

## Trigger

- dev-pipeline에서 bug type Issue의 In Progress 단계 진입 시
- `/활성화`에서 bug type Issue가 In Progress 상태일 때 재개

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Summary, Success Criteria) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **패턴 분류**: Linear description + title 분석하여 AI 추천안 도출 → `AskUserQuestion`으로 3패턴 중 선택 (§패턴 분류 참조) |
| 2 (G1) | **원인 조사**: 패턴별 조사 에이전트 실행 (§패턴별 에이전트 체인 참조) |
| 3 (G1) | **수정 계획 제시**: Root Cause + 수정 방안을 사용자에게 제시 |
| 4 (G2) | **사용자 승인**: `AskUserQuestion`으로 수정 계획 확인. 승인 전 코드 수정 시작 금지 |
| 5 (G3) | **Linear comment 기록**: 패턴 선택 + Root Cause 요약 comment |
| 6 (G4) | **코드 수정**: 패턴별 에이전트 체인으로 수정 구현 |
| 7 (G4) | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 8 (G4) | **verify 자동 호출**: verify 스킬로 Success Criteria 검증 |
| 9 (G4) | verify PASS 시 **커밋**: `fix: ...` (Conventional Commits) |
| 10 (G3) | verify PASS 시: **Linear State → In Review** + fix 요약 **Linear comment** 기록 |
| 11 | **In Review → Done**: 사용자 직접 확인 → 승인 시 **issue-close 자동 호출** |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 6로 복귀

---

## 패턴 분류

### 분류 기준

`AskUserQuestion`으로 사용자에게 3패턴 중 선택을 요청한다. AI가 Linear description + title 분석 기반으로 추천안을 제시한다.

| 패턴 | 설명 | AI 추천 조건 |
|------|------|-------------|
| **기본** | 원인 파악 → 수정 → 테스트 → 검증 | 기본 추천 (다른 조건에 해당하지 않을 때) |
| **경량** | 바로 수정 → 리뷰 → 검증 | description에 원인/수정 방안이 이미 명시된 경우 |
| **원인불명** | 증거 수집 → 근본 원인 → 수정 → 검증 | description에 재현 조건 불명확, 간헐적 발생 등 명시된 경우 |

### 패턴별 에이전트 체인

| 패턴 | 에이전트 체인 |
|------|-------------|
| **기본** | `debugger`(원인 파악) → `executor`(수정) → `test-engineer`(테스트 추가) → `verifier`(검증) |
| **경량** | `executor`(구현) → `code-reviewer`(리뷰) → `verifier`(검증) |
| **원인불명** | `tracer`(증거 수집) → `debugger`(근본 원인) → `executor`(수정) → `verifier`(검증) |

---

## 로그 전략

Git 문서 대신 **Linear comment**로 전 과정을 기록한다.

| 시점 | Linear comment 내용 |
|------|-------------------|
| 패턴 선택 후 | `Bug 수정 시작 — 패턴: {기본/경량/원인불명}` |
| 조사 완료 후 | `Root Cause: {1줄 요약}. 수정 방안: {1줄 요약}` |
| 구현·검증 완료 후 | `Fix 완료 — {변경 파일 수}개 파일 수정. verify {PASS/FAIL}` |

> Git 폴더(`docs/issue/{ID}/`)를 생성하지 않는다. 코드 변경은 git commit(`fix: ...`)으로 기록.

---

## Output

| 항목 | 내용 |
|------|------|
| 코드 변경 | 버그 수정 + 테스트 |
| 커밋 | `fix: ...` (Conventional Commits) |
| Linear comment | 패턴 선택 → Root Cause → fix 요약 (3회) |
| Linear | State → In Review (verify PASS 시) |

---

## complexity 전환

| 조건 | 행동 |
|------|------|
| 복잡한 버그로 판단 | `AskUserQuestion`으로 사용자에게 improvement type 전환 제안 |
| 전환 승인 시 | Linear Label을 `improvement`로 변경 → Plan → implement 경로 사용 |
| 판단 기준 | 수정 대상 파일 3개 이상, 모듈 간 영향, 설계 변경 필요 시 |

---

## OMC 에이전트 연동

| 패턴 | 에이전트 | 모델 |
|------|---------|------|
| 기본 | `oh-my-claudecode:debugger` | sonnet |
| 기본 | `oh-my-claudecode:executor` | sonnet |
| 기본 | `oh-my-claudecode:test-engineer` | sonnet |
| 기본 | `oh-my-claudecode:verifier` | sonnet |
| 경량 | `oh-my-claudecode:executor` | sonnet |
| 경량 | `oh-my-claudecode:code-reviewer` | sonnet |
| 경량 | `oh-my-claudecode:verifier` | sonnet |
| 원인불명 | `oh-my-claudecode:tracer` | sonnet |
| 원인불명 | `oh-my-claudecode:debugger` | sonnet |
| 원인불명 | `oh-my-claudecode:executor` | sonnet |
| 원인불명 | `oh-my-claudecode:verifier` | sonnet |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description에서 SC 조회 | 수정 시작 전 1회 |
| 패턴 선택 comment | 패턴 분류 직후 |
| Root Cause comment | 조사 완료 후 |
| 구현·검증 완료 comment | verify PASS 후 — fix 요약 |
| State → In Review 전이 | verify PASS 시 |
