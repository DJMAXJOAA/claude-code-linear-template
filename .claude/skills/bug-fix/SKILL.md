---
name: bug-fix
description: "bug type Issue의 수정 프로세스 오케스트레이터. Git 폴더 생성. deep-dive로 원인 조사 → spec.md 산출. plan.md는 인터뷰 분기(선택)."
---

# bug-fix — 버그 수정 오케스트레이터

bug type Issue의 수정 프로세스를 오케스트레이션한다. Git 폴더를 생성하며, deep-dive로 원인 조사 후 spec.md를 산출한다. plan.md는 인터뷰 분기(선택)로 제공한다.

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
| 1 (G1) | **원인 조사**: `oh-my-claudecode:deep-dive` 호출 (trace → deep-interview). Linear description (Overview, AC) + 코드베이스 컨텍스트를 input으로 전달. 산출물: `docs/issue/{LINEAR-ID}/spec.md` (trace 결과 + Root Cause + 수정 방안 포함) |
| 3 (G1) | **수정 계획 제시**: deep-dive 결과의 Root Cause + 수정 방안을 사용자에게 제시 |
| 4 (G2) | **사용자 승인**: `AskUserQuestion`으로 수정 계획 확인. 승인 전 코드 수정 시작 금지 |
| 4a (G3) | **Git 폴더 생성 (미존재 시에만)**: `docs/issue/{LINEAR-ID}/` 폴더 생성. 이미 존재하면 스킵 |
| 4b (G3) | **plan.md 인터뷰**: `AskUserQuestion`으로 plan.md 생성 여부 질문. 승인 시 간소화 생성 (Root Cause + 수정 방안 요약). 스킵 시 spec.md만 유지 |
| 5 (G4) | **코드 수정**: `oh-my-claudecode:ralph` 호출로 수정 구현 + 테스트. spec.md Root Cause + 수정 방안 + plan.md(선택)를 input으로 전달. 산출물: `docs/issue/{LINEAR-ID}/prd.json`, `docs/issue/{LINEAR-ID}/progress.txt` |
| 6 (G4) | **빌드 확인**: 린트 + 타입체크 + 테스트 통과 |
| 7 (G4) | **verify 자동 호출**: verify 스킬로 Acceptance Criteria 검증 |
| 8 (G4) | verify PASS 시 **커밋**: `fix: ...` (Conventional Commits) |
| 9 (G3) | verify PASS 시: **Linear State → In Review** + Root Cause + fix 요약 **Linear comment** 기록 |
| 10 | **In Review → Done**: 사용자 직접 확인 → 승인 시 **issue-close 자동 호출** (축약 경로: 검토→progress.txt Checkpoints 환류→Done→comment→참조 문서 동기화) |

> verify FAIL 시: 실패 항목 목록 + 수정 방안 제시 → 단계 5로 복귀

## deep-dive spec.md Frontmatter 래핑

deep-dive 산출물을 spec.md로 저장할 때 다음 frontmatter를 래핑한다:

```yaml
---
linear_id: "{LINEAR-ID}"
title: "Spec: {제목}"
type: spec
issue_type: bug
created: "{YYYY-MM-DD}"
---
```

저장 경로: `docs/issue/{LINEAR-ID}/spec.md`

## ralph 호출 패턴

| 항목 | 내용 |
|------|------|
| ralph input | spec.md Root Cause + 수정 방안 + plan.md(선택) |
| ralph output | prd.json + progress.txt |
| 저장 | `docs/issue/{LINEAR-ID}/prd.json`, `docs/issue/{LINEAR-ID}/progress.txt` |

## Output

| 항목 | 내용 |
|------|------|
| 코드 변경 | 버그 수정 + 테스트 |
| Git 문서 | `docs/issue/{LINEAR-ID}/` — spec.md, plan.md(선택), prd.json, progress.txt |
| 커밋 | `fix: ...` (Conventional Commits) |
| Linear comment | Root Cause + fix 요약 |
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

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 원인 조사 (trace + deep-interview) | `oh-my-claudecode:deep-dive` | deep-dive 내부 라우팅 |
| 코드 수정 | `oh-my-claudecode:ralph` | ralph 내부 라우팅 |
| 검증 | verify 스킬 (`oh-my-claudecode:verifier`) | sonnet |

> OMC 비활성 시 fallback: deep-dive 비활성 → `oh-my-claudecode:explore`(haiku) + `oh-my-claudecode:debugger`(sonnet) + `oh-my-claudecode:tracer`(sonnet)으로 대체. ralph 비활성 → `oh-my-claudecode:executor`(sonnet)으로 대체. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description에서 AC 조회 | 수정 시작 전 1회 |
| State → In Review 전이 | verify PASS 시 |
| Root Cause + fix 요약 기록 | verify PASS 후 comment |
