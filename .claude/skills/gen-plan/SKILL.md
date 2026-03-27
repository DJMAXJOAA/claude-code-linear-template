---
name: gen-plan
description: "prd.md + technical.md(조건부) + plan.md 생성. dev-pipeline에서 Planning 단계 진입 시 호출."
---

# gen-plan — prd.md + technical.md + plan.md 생성

dev-pipeline에서 Planning 단계 진입 시 호출되어, `docs/issue/{LINEAR-ID}/`에 `prd.md` → `technical.md`(조건부) → `plan.md` 순서로 생성한다.

## Trigger

- dev-pipeline에서 Pre-Plan Q/A 완료 후 자동 호출 (이미 Planning 상태)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Summary, SC), type, labels, relations |
| note.md | `docs/issue/{LINEAR-ID}/note.md` — 존재 확인 (gen-hub에서 생성됨) |
| 코드베이스 조사 결과 | Pre-Plan Q/A Phase 1에서 수집된 관련 파일, 아키텍처 가이드 |
| 설계 결정 목록 | Pre-Plan Q/A Phase 2 항목별 인터뷰에서 사용자가 확정한 설계 결정 목록 |
| SC 확정 결과 | Pre-Plan Q/A Phase 1 Step 3c에서 확정된 SC |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **Linear Issue 정보 읽기**: Linear MCP로 description(Summary, SC), type, relations 조회 |
| 2 (G1) | **Related Issue 교차 참조**: Linear relations에서 related/blocked-by Issue 목록 수집 → 해당 Issue의 `docs/issue/{ID}/plan.md`에서 `## 8. Outcome` 섹션 읽기 → 설계 이탈, 미해결 이슈 확인 |
| 3 (G1) | **prd.md 작성**: §prd.md 구조에 따라 작성. Linear description(Summary + SC) + 도메인 spec(연결 시) + 코드 조사 결과를 입력으로 사용자 인터뷰 진행 |
| 4 (G2) | **prd.md 사용자 검토**: `AskUserQuestion`으로 prd.md 내용 확인/수정 |
| 5 (G1) | **technical.md 생성 판별**: prd.md 기반으로 복잡도 판별 → 조건 충족 시 `AskUserQuestion`으로 사용자에게 technical.md 작성 여부 확인 |
| 6 (G1) | **technical.md 작성** (조건부): §technical.md 구조에 따라 작성. prd.md + SC를 입력으로 사용자 인터뷰 진행 |
| 7 (G2) | **technical.md 사용자 검토** (조건부): `AskUserQuestion`으로 확인/수정 |
| 8 (G1) | **plan.md 작성**: §plan.md 구조에 따라 작성. prd.md FR에서 Verification 초안 자동 파생. technical.md 존재 시 참조 |
| 9 (G1) | **도메인 spec FR→Verification 보강**: Linear Documents에 spec 경로 존재 시, 해당 spec의 `requirements.md` FR 테이블에서 추가 Verification 항목 파생 |
| 10 (G2) | **Plan 사용자 검토**: Post-Plan Q/A에서 `AskUserQuestion`으로 사용자 승인 (dev-pipeline 위임) |
| 11 (G3) | **Git 커밋 + Linear Documents 갱신**: 생성된 문서(prd.md, technical.md, plan.md) Git 커밋 + description `## Documents` 섹션에 경로 추가 |
| 12 (G3) | **Linear comment 기록**: Linear MCP로 Plan 완료 요약 comment (태스크 수, 주요 설계 결정 1~2줄) |
| 13 (G4) | **완료 반환**: 문서 생성 완료. 리뷰는 dev-pipeline의 Post-Plan Q/A에서 처리 |

### technical.md 생성 판별 (Step 5)

| 조건 | 행동 |
|------|------|
| 3+ 컴포넌트 상호작용 | 생성 권장 → `AskUserQuestion` |
| 새 인터페이스/추상화 도입 | 생성 권장 → `AskUserQuestion` |
| 기존 구조 재설계 | 생성 권장 → `AskUserQuestion` |
| 해당 없음 | 스킵 — plan.md Approach에 직접 기술 |

---

## FR→Verification 파생 매핑 규칙

> prd.md의 EARS 형식 FR에서 plan.md Verification 초안을 자동 파생. plan.md Requirements Traceability 테이블과 일관성 유지.

### 이슈 prd.md FR 파생 (항상 수행)

| EARS 패턴 | Verification 변환 |
|-----------|------------------|
| When {trigger} ... shall {action} | 검증: {trigger} 시 / 기대: {action} 수행됨 |
| While {state} ... shall {action} | 검증: {state} 중 / 기대: {action} 지속됨 |
| If {condition} ... shall {action} | 검증: {condition} 재현 / 기대: {action} 수행됨 |
| Where {constraint} ... shall {action} | 검증: {constraint} 경계값 / 기대: 범위 내 |
| Ubiquitous | 검증: {action} 확인 / 기대: 항상 수행됨 |

### 도메인 spec FR 보강 (연결 존재 시, Step 9)

> Linear Documents에 spec 경로 존재 시, 해당 spec의 `requirements.md`에서 추가 파생.

| 우선순위 | 소스 | 조건 |
|---------|------|------|
| 1 | prd.md FR | 항상 수행 (기본 동작) |
| 2 | 도메인 spec FR | spec 연결 존재 시 보강 |
| 중복 | prd.md 우선 | 동일 검증 항목은 prd 소스 유지, spec은 보충 |

> **도메인 spec 미연결 시**: Linear Documents에 spec 경로 없음 → 1번만 수행 (기존 동작 유지).
> **Grandfathered spec**: Spec 존재하나 FR-ID 미보유 → 동일하게 스킵.

## Output

| 항목 | 내용 |
|------|------|
| prd.md | `docs/issue/{LINEAR-ID}/prd.md` |
| technical.md | `docs/issue/{LINEAR-ID}/technical.md` (조건부) |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` |
| Linear Documents | description Documents 섹션에 경로 추가 |
| Linear comment | Plan 완료 요약 기록 |

---

## prd.md 구조

> prd.md 템플릿 + EARS 패턴 가이드: [templates/prd-template.md](templates/prd-template.md)

---

## technical.md 구조

> technical.md 템플릿 + Mermaid 가이드 + 생성 판별: [templates/technical-template.md](templates/technical-template.md)

---

## plan.md 구조

> plan.md 템플릿 + type별 작성 범위: [templates/plan-template.md](templates/plan-template.md)

---

## OMC 에이전트 연동

> gen-plan 자체는 에이전트 연동 없음. Plan 리뷰는 dev-pipeline의 Post-Plan Q/A에서 `oh-my-claudecode:architect` ∥ `oh-my-claudecode:critic` 병렬 합의 리뷰 사용.

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description·type·relations 조회 | 플랜 작성 전 1회 |
| Plan 완료 요약 comment | 태스크 수 + 주요 설계 결정 1~2줄 |
| description Documents 갱신 | 생성된 문서 경로 추가 |
