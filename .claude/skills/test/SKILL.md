# test — 테스트 전략 수립 및 실행

feature type에서 구현 완료 후 Testing 단계에서 테스트 전략을 수립하고 실행한다.

## Trigger

- dev-pipeline에서 Testing 단계 진입 시 (feature 전용)
- In Progress → Testing 상태 전이 후 자동 호출

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| cl.md | `docs/issue/{LINEAR-ID}/cl.md` — S3 검증 조건, S4 수동 테스트 가이드 |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` — 설계 참조 |
| 코드 변경 | 구현된 코드 (git diff 기반) |

## Process

| 단계 | 행위 |
|------|------|
| 1 | **테스트 범위 분석**: CL S3 + Plan에서 테스트 대상 도출 |
| 2 | **테스트 전략 수립**: 단위/통합/E2E 테스트 계획 |
| 3 | **G2 검토**: `AskUserQuestion`으로 테스트 전략 사용자 승인 |
| 4 | **테스트 작성 및 실행**: `oh-my-claudecode:test-engineer`에 위임 |
| 5 | **결과 확인**: 전체 테스트 스위트 통과 확인 |
| 6 | **커밋**: 테스트 코드 커밋 (`test: ...`) |
| 7 | **상태 전이**: Linear State → Verifying |

## Output

| 항목 | 내용 |
|------|------|
| 테스트 코드 | 테스트 전략에 따른 테스트 파일 |
| 커밋 | 테스트 코드 커밋 |
| Linear | State → Verifying (Testing 완료) |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 테스트 작성/실행 | `oh-my-claudecode:test-engineer` | sonnet |

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| 상태 전이 | `linear_update_issue` | State: Testing → Verifying |
