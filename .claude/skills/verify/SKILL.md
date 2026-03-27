---
name: verify
description: "구현 완료 후 Success Criteria, plan.md Verification 검증 조건, 코드 품질을 종합 검증. PASS/FAIL 결과 반환."
---

# verify — 구현 완전성 검증

구현 완료 후 Success Criteria, plan.md Verification 검증 조건, 코드 품질을 종합 검증한다. 검증 결과(PASS/FAIL)를 반환하며, 후속 처리는 dev-pipeline이 결정한다.

## Trigger

- implement 완료 후 자동 호출 (feature/improvement)
- bug 수정 완료 후 dev-pipeline에서 자동 호출
- `/검증` 커맨드에서 구현 검증으로 호출 시 (프레임워크 검증과 별도)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description의 Success Criteria (feature/improvement) 또는 Acceptance Criteria (bug) — SC 직접 참조 |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` — Verification 섹션의 검증 조건 (feature / improvement-standard만. bug 및 improvement-light는 없음) |
| 코드 변경 | 구현된 코드 (git diff 기반) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **Linear SC 조회**: Issue description에서 Success Criteria 추출 |
| 2 (G1) | **plan.md Verification 읽기**: plan.md Verification 섹션의 각 검증 항목 확인 |
| 3 (G1) | **검증 실행**: 각 SC + Verification 항목에 대해 테스트 실행, 코드 확인, 빌드 검증 |
| 4 (G1) | **검증 결과 정리**: PASS/FAIL 판정 + 근거 |
| 5 (G2) | **사용자에게 결과 제시**: `AskUserQuestion`으로 검토 |
| 6 (G3) | **Linear comment 기록**: Linear MCP로 검증 결과 comment (PASS/FAIL + 항목별 요약 1~3줄) |
| 7a (G4) | **PASS**: 검증 결과(PASS)를 반환. dev-pipeline이 issue-close 후속 결정 |
| 7b (G4) | **FAIL**: 실패 항목 목록 + 수정 방안 제시. 검증 결과(FAIL)를 반환. dev-pipeline이 implement 복귀 후속 결정 |

## Output

| 항목 | 내용 |
|------|------|
| 검증 결과 | PASS/FAIL 판정 + 항목별 근거 |
| Linear comment | 검증 결과 요약 기록 |

> verify는 Linear 상태 전이를 수행하지 않는다. 호출자(implement/dev-pipeline)가 PASS 시 In Review로 전이.

---

## 검증 체크리스트

| 카테고리 | 검증 항목 |
|----------|---------|
| **SC 충족** | Linear Issue description의 모든 Success Criteria 충족 (SC 직접 참조) |
| **Verification** | plan.md Verification 섹션의 모든 검증 항목 PASS (improvement-light / bug는 Verification 없음 → SC 기반 검증으로 fallback) |
| **빌드** | 린트 + 타입체크 + 전체 테스트 통과 |
| **코드 품질** | 프로젝트별 coding rules 준수 (`.claude/rules/coding.md` — 미존재 시 해당 체크 스킵) |
| **범위** | Plan 범위 외 변경 없음 (improvement-light는 Linear description의 변경 의도 기준) |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 검증 실행 | `oh-my-claudecode:verifier` | sonnet |
| 코드 리뷰 | `oh-my-claudecode:code-reviewer` | opus (선택) |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description에서 SC 조회 | 검증 시작 전 1회 |
| 검증 결과(PASS/FAIL) comment 기록 | G3 단계 |
