---
name: gen-plan
description: "ralplan 호출 + OMC 네이티브 산출물(plan.md + technical.md) 생성. frontmatter 래핑. dev-pipeline에서 Planning 단계 진입 시 호출."
---

# gen-plan — ralplan 호출 + plan.md + technical.md 생성

dev-pipeline에서 Planning 단계 진입 시 호출되어, ralplan을 통해 `docs/issue/{LINEAR-ID}/`에 `plan.md` + `technical.md`를 생성한다. **spec.md는 gen-plan이 생성하지 않음** — Pre-Plan 단계에서 deep-interview/deep-dive가 생성한 산출물을 입력으로 사용한다.

## Trigger

- dev-pipeline에서 Pre-Plan Q/A 완료 후 자동 호출 (이미 Planning 상태)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Summary, SC), type, labels, relations |
| intensity | 실행 강도 — `Light` / `Standard` / `Deep` |
| spec.md | `docs/issue/{LINEAR-ID}/spec.md` — deep-interview/deep-dive 산출물 (존재 확인) |
| 코드베이스 조사 결과 | Pre-Plan Q/A Phase 1에서 수집된 관련 파일, 아키텍처 가이드 |
| 설계 결정 목록 | Pre-Plan Q/A Phase 2 항목별 인터뷰에서 사용자가 확정한 설계 결정 목록 |
| SC 확정 결과 | Pre-Plan Q/A Phase 1 Step 3c에서 확정된 SC |

### 호출자별 Input 매핑

| 호출자 | intensity | 코드베이스 조사 결과 | 설계 결정 목록 | SC 확정 결과 | deep-interview 산출물 |
|--------|-----------|-------------------|--------------|-------------|----------------------|
| **feature Light** (dev-pipeline) | Light | Pre-Plan Q/A Phase 1 탐색 결과 | — (간소 plan, 설계 인터뷰 생략) | — | 미포함 |
| **feature Standard** (dev-pipeline) | Standard | Pre-Plan Q/A Phase 1 탐색 결과 | Pre-Plan Q/A Phase 2 항목별 인터뷰 결과 | Phase 1 Step 3c SC | 미포함 |
| **feature Deep** (dev-pipeline) | Deep | Pre-Plan Q/A Phase 1 탐색 결과 | Pre-Plan Q/A Phase 2 항목별 인터뷰 결과 | Phase 1 Step 3c SC | deep-interview 산출물 포함 |
| **improvement-standard** (improvement-fix) | Standard | Pre-Plan 인터뷰 4항목 중 '변경 범위' + explore 탐색 결과 | Pre-Plan 인터뷰 4항목 중 '접근방식' 결정 | Pre-Plan 인터뷰 4항목 중 'SC' | 미포함 |
| **improvement Deep** (improvement-fix) | Deep | Pre-Plan 인터뷰 4항목 중 '변경 범위' + explore 탐색 결과 | Pre-Plan 인터뷰 4항목 중 '접근방식' 결정 | Pre-Plan 인터뷰 4항목 중 'SC' | deep-interview 산출물 포함 |

> improvement-standard에서 미제공 필드(related issue 환류 등)는 gen-plan이 자체 수집.

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **Linear Issue 정보 읽기**: Linear MCP로 description(Summary, SC), type, relations 조회 |
| 2 (G1) | **Related Issue 교차 참조**: Linear relations에서 related/blocked-by Issue 목록 수집 → 해당 Issue의 `docs/issue/{ID}/plan.md`에서 `## Outcome` 섹션 읽기 → 설계 이탈, 미해결 이슈 확인 |
| 2a (G2) | **intensity별 실행 경로 결정**: intensity 값에 따라 자동 분기 — Light: ralplan 미호출, gen-plan이 간소 plan.md 직접 생성 (technical.md 미생성). Standard: ralplan 일반 모드 호출. Deep: ralplan `--deliberate` 모드 강제 호출 (항상 interactive) |
| 3 (G1) | **ralplan 호출 (Standard/Deep만)**: 선택된 모드로 ralplan 호출. spec.md + Linear SC + Related Issue 환류 + 코드 조사 결과 + 설계 결정을 전달하여 plan.md + technical.md 함께 생성 (§ralplan 호출 지시 패턴 참조). Light intensity는 이 단계를 스킵하고 gen-plan이 직접 plan.md 생성 |
| 4 (G2) | **Plan 사용자 검토**: Post-Plan Q/A에서 `AskUserQuestion`으로 사용자 승인 (dev-pipeline 위임) |
| 5 (G3) | **Frontmatter 래핑 + Git 커밋**: ralplan 산출물(또는 gen-plan 직접 생성 산출물)에 frontmatter 래핑(§Frontmatter 래핑 패턴) 후 Git 커밋 + Linear Documents 갱신 |
| 6 (G3) | **Linear comment 기록**: Linear MCP로 Plan 완료 요약 comment (태스크 수, 주요 설계 결정 1~2줄) |
| 7 (G4) | **완료 반환**: 문서 생성 완료. 리뷰는 dev-pipeline의 Post-Plan Q/A에서 처리 |

---

## Frontmatter 래핑 패턴

ralplan 산출물 상단에 프레임워크 frontmatter를 삽입한다.

### plan.md 래핑

```markdown
---
linear_id: {LINEAR-ID}
title: "Plan: {Issue 제목}"
type: plan
created: {YYYY-MM-DD}
---
> [Linear Issue]({URL})

(이하 OMC ralplan 네이티브 콘텐츠)
```

### technical.md 래핑

```markdown
---
linear_id: {LINEAR-ID}
title: "Technical: {Issue 제목}"
type: technical
created: {YYYY-MM-DD}
---
> [Linear Issue]({URL})

(이하 OMC ralplan 네이티브 콘텐츠)
```

---

## ralplan 호출 지시 패턴

gen-plan이 ralplan에 전달하는 컨텍스트:

| 항목 | 내용 |
|------|------|
| spec.md | `docs/issue/{ID}/spec.md` 전체 내용 (deep-interview/deep-dive 산출물) |
| Linear SC | Issue description의 Success Criteria |
| Related Issue 환류 | Step 2에서 수집한 관련 Issue Outcome 요약 |
| 코드 조사 결과 | Pre-Plan Q/A에서 수집된 탐색 결과 |
| 설계 결정 | Pre-Plan Q/A Phase 2 항목별 인터뷰 결과 |
| 요청 산출물 | plan.md + technical.md (함께 생성) |
| FR→Verification 규칙 | spec.md FR에서 Verification 자동 파생 지시 (EARS 매핑 포함, §FR→Verification 파생 매핑 규칙 참조) |

> **Light intensity**: ralplan을 호출하지 않는다. gen-plan이 직접 간소 plan.md를 생성하며, Tasks 목록만 포함한다. technical.md는 생성하지 않는다.

---

## plan.md 보존 구조

ralplan이 생성하는 plan.md에 프레임워크가 요구하는 필수 구조:

| 섹션 | 필수 여부 | 이유 |
|------|----------|------|
| Tasks (ID, Task, Dependencies, Status) | 필수 | implement(ralph)가 태스크 순서/상태 관리에 사용 |
| Verification | 필수 | verify 스킬이 검증 항목으로 사용 |
| Outcome | 필수 (빈 상태) | issue-close가 구현 결과 기록에 사용 |
| Requirements Traceability | 선택 (FR 존재 시) | spec.md FR → Task → Verification 추적 |

> ralplan 호출 시 위 구조를 포함하도록 지시. OMC가 생성하는 나머지 섹션(Goal, Approach, Risks 등)은 OMC 양식 그대로.
> **Light intensity**: Tasks 목록만 포함하는 간소 plan.md 생성. Verification, Outcome 섹션은 최소한으로 포함.

---

## FR→Verification 파생 매핑 규칙

> spec.md의 EARS 형식 FR에서 plan.md Verification 초안을 자동 파생. ralplan에 이 규칙을 전달하여 Verification 생성 시 적용하도록 지시한다. plan.md Requirements Traceability 테이블과 일관성 유지.

### 이슈 spec.md FR 파생 (항상 수행)

| EARS 패턴 | Verification 변환 |
|-----------|------------------|
| When {trigger} ... shall {action} | 검증: {trigger} 시 / 기대: {action} 수행됨 |
| While {state} ... shall {action} | 검증: {state} 중 / 기대: {action} 지속됨 |
| If {condition} ... shall {action} | 검증: {condition} 재현 / 기대: {action} 수행됨 |
| Where {constraint} ... shall {action} | 검증: {constraint} 경계값 / 기대: 범위 내 |
| Ubiquitous | 검증: {action} 확인 / 기대: 항상 수행됨 |

### 도메인 spec FR 보강 (연결 존재 시)

> Linear Documents에 spec 경로 존재 시, 해당 spec의 `requirements.md`에서 추가 파생.

| 우선순위 | 소스 | 조건 |
|---------|------|------|
| 1 | spec.md FR | 항상 수행 (기본 동작) |
| 2 | 도메인 spec FR | spec 연결 존재 시 보강 |
| 중복 | spec.md 우선 | 동일 검증 항목은 spec.md 소스 유지, 도메인 spec은 보충 |

> **도메인 spec 미연결 시**: Linear Documents에 spec 경로 없음 → 1번만 수행 (기존 동작 유지).
> **Grandfathered spec**: Spec 존재하나 FR-ID 미보유 → 동일하게 스킵.

## Output

| intensity | plan.md | technical.md | Linear Documents | Linear comment |
|-----------|---------|--------------|-----------------|----------------|
| **Light** | `docs/issue/{LINEAR-ID}/plan.md` (Tasks 목록만 포함하는 간소 plan) | 미생성 | 경로 추가 (plan.md만) | Plan 완료 요약 기록 |
| **Standard** | `docs/issue/{LINEAR-ID}/plan.md` | `docs/issue/{LINEAR-ID}/technical.md` | 경로 추가 | Plan 완료 요약 기록 |
| **Deep** | `docs/issue/{LINEAR-ID}/plan.md` | `docs/issue/{LINEAR-ID}/technical.md` | 경로 추가 | Plan 완료 요약 기록 |

---

## OMC 에이전트 연동

> gen-plan은 intensity에 따라 ralplan 호출 방식을 결정한다:
> - **Light**: ralplan을 호출하지 않는다. gen-plan이 기본 모델로 직접 간소 plan.md를 생성한다.
> - **Standard**: `oh-my-claudecode:ralplan` 일반 모드로 호출하여 plan.md + technical.md를 생성한다.
> - **Deep**: `oh-my-claudecode:ralplan --deliberate` 모드로 강제 호출. 항상 interactive로 진행한다.

> Plan 리뷰는 dev-pipeline의 Post-Plan Q/A에서 `oh-my-claudecode:architect` ∥ `oh-my-claudecode:critic` 병렬 합의 리뷰 사용.

> **OMC 비활성 시 fallback**: ralplan 호출 실패 시, gen-plan이 직접 plan.md + technical.md를 기본 모델로 생성한다. 이때 §plan.md 보존 구조를 준수하되, 양식은 간소화. 비활성이 감지되면 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description·type·relations 조회 | 플랜 작성 전 1회 |
| Plan 완료 요약 comment | 태스크 수 + 주요 설계 결정 1~2줄 (intensity 표기 포함) |
| description Documents 갱신 | 생성된 문서 경로 추가 (Light는 plan.md만, Standard/Deep는 plan.md + technical.md) |
