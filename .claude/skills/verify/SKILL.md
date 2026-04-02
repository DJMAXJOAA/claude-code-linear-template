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
| 1 (G1) | **Linear SC 조회**: `linear_payload` 전달 시 description에서 SC 추출 (Linear MCP 조회 스킵). 미전달 시 Linear MCP로 Issue description에서 Success Criteria 추출 |
| 2 (G1) | **plan.md Verification 읽기**: plan.md Verification 섹션의 각 검증 항목 확인 |
| 3 (G1) | **검증 실행**: 각 SC + Verification 항목에 대해 테스트 실행, 코드 확인, 빌드 검증 |
| 4 (G1) | **검증 결과 정리**: PASS/FAIL 판정 + 근거 |
| 5a (G4) | **PASS**: 검증 결과 요약을 출력하고, 검증 결과(PASS)를 즉시 반환. `pending_manual_review` 항목이 있으면 목록을 함께 반환. 인터뷰 없이 자동 진행 — 호출자가 In Review 전이 수행 |
| 5b (G4) | **FAIL**: `AskUserQuestion`으로 실패 항목 목록 + 수정 방안 제시. 검증 결과(FAIL)를 반환. dev-pipeline이 implement 복귀 후속 결정 |

## Output

| 항목 | 내용 |
|------|------|
| 검증 결과 | PASS/FAIL 판정 + 항목별 근거 |
| SC별 판정 | SC 항목별 PASS/FAIL 매핑 + 근거 (issue-close SC 체크 입력용) |

> verify는 Linear 상태 전이 및 Linear comment 기록을 수행하지 않는다. 호출자(implement/dev-pipeline)가 PASS 시 In Review 전이 + 구현·검증 통합 comment를 기록.

---

## 검증 체크리스트

| 카테고리 | 검증 항목 |
|----------|---------|
| **SC 충족** | Linear Issue description의 모든 Success Criteria 충족 (SC 직접 참조) |
| **Verification** | plan.md Verification 섹션의 모든 검증 항목 PASS (improvement-light는 Verification 없음 → SC 기반 검증으로 fallback. bug는 Verification 없음 → SC 기반 fallback. **SC도 Verification도 없으면 빌드/테스트 통과 + 코드 품질 검증만 수행하고 PASS 반환. 단, `pending_manual_review`에 'SC 미정의 — 사용자 수동 확인 필수' 항목 추가**) |
| **빌드** | 린트 + 타입체크 + 전체 테스트 통과 |
| **코드 품질** | 프로젝트별 coding rules 준수 (`.claude/rules/coding.md` — 미존재 시 해당 체크 스킵) |
| **범위** | Plan 범위 외 변경 없음 (improvement-light는 Linear description의 변경 의도 기준) |
| **수동 확인** | 자동 검증 불가 항목은 `pending_manual_review`로 표기. In Review에서 사용자가 수동 확인 (v4.9.2+) |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 검증 실행 | `oh-my-claudecode:verifier` | sonnet |
| 코드 리뷰 | `oh-my-claudecode:code-reviewer` | opus (선택) |

> OMC 비활성 시: pipeline.md §7 참조.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description에서 SC 조회 | 검증 시작 전 1회 |

> verify는 Linear comment를 직접 기록하지 않는다. 호출자(implement)가 구현+검증 통합 comment를 기록.
