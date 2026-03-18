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
| 1 (G1) | **테스트 범위 분석**: CL S3 + Plan에서 테스트 대상 도출 |
| 2 (G1) | **테스트 전략 수립**: 아래 §테스트 분류 기준에 따라 단위/통합/E2E 테스트 계획 수립 |
| 3 (G2) | **검토**: `AskUserQuestion`으로 테스트 전략 사용자 승인 |
| 4 (G4) | **테스트 작성 및 실행**: `oh-my-claudecode:test-engineer`에 위임 |
| 5 (G4) | **결과 확인**: 전체 테스트 스위트 통과 확인 |
| 6 (G3) | **커밋**: 테스트 코드 커밋 (`test: ...`) |
| 7 (G3) | **상태 전이**: Linear State → Verifying |

## Output

| 항목 | 내용 |
|------|------|
| 테스트 코드 | 테스트 전략에 따른 테스트 파일 |
| 커밋 | 테스트 코드 커밋 |
| Linear | State → Verifying (Testing 완료) |

---

## 테스트 분류 기준

### 테스트 유형 선택 가이드

| 유형 | 적용 기준 | 커버리지 기대치 |
|------|----------|--------------|
| **단위(Unit)** | 함수/클래스 단위 로직, 순수 함수, 유틸리티 | 핵심 비즈니스 로직 80%+ |
| **통합(Integration)** | 모듈 간 인터페이스, DB/API 연동, 서비스 계층 | 주요 연동 시나리오 전수 |
| **E2E** | 사용자 시나리오 전체 흐름, UI 포함 기능 | 핵심 사용자 플로우 전수 |

### 유형 선택 우선순위

| 조건 | 권장 유형 |
|------|---------|
| 새 비즈니스 로직 추가 | 단위 테스트 필수 + 통합 테스트 |
| API 엔드포인트 변경 | 통합 테스트 필수 |
| UI/사용자 플로우 변경 | E2E 테스트 권장 |
| 리팩토링(동작 불변) | 기존 테스트 회귀 확인 위주 |
| 버그 수정 | 재현 단위 테스트 + 회귀 테스트 |

> 프로젝트 테스트 프레임워크는 CLAUDE.md §3 Tech Stack 참조.

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 테스트 작성/실행 | `oh-my-claudecode:test-engineer` | sonnet |

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| 상태 전이 | `save_issue` (id 지정) | State: Testing → Verifying |
