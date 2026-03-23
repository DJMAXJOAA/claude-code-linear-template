# gen-plan — plan.md + cl.md 생성

dev-pipeline에서 Planning 단계 진입 시 호출되어, `docs/issue/{LINEAR-ID}/plan.md`와 `cl.md`를 동시 생성한다.

## Trigger

- dev-pipeline에서 Pre-Plan Q/A 완료 후 자동 호출 (이미 Planning 상태)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, SC), type, labels, relations |
| _index.md | `docs/issue/{LINEAR-ID}/_index.md` — 기존 문서 목록 확인 |
| 코드베이스 조사 결과 | Pre-Plan Q/A Phase 0에서 수집된 관련 파일, 아키텍처 가이드 |
| How 인터뷰 결과 | Pre-Plan Q/A Phase 1에서 확정된 SC, 스펙, Decisions, 리스크, 범위 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **Linear Issue 정보 읽기**: Linear MCP로 description(Overview, SC), type, relations 조회 |
| 2 (G1) | **Related Issue Known Limitations 교차 참조**: Linear relations에서 related/blocked-by Issue 목록 수집 → 해당 Issue의 `docs/issue/{ID}/_index.md`에서 `## 구현 결과` 섹션 읽기 → 설계 이탈, 미해결 이슈 확인 |
| 3 (G1) | **plan.md 작성**: 아래 §plan.md 구조에 따라 작성. type에 따라 작성 범위 결정 |
| 4 (G1) | **cl.md 작성**: 아래 §cl.md 구조에 따라 작성. Plan의 접근 방식에서 태스크 추출 (S1). **Spec 연결 확인**: `_index.md` Documents 테이블에 Spec 행 존재 시, 해당 spec 하위 문서의 FR 테이블을 읽어 S3 검증 항목 초안을 EARS 패턴에서 파생. Spec 미존재 또는 FR-ID 미보유(grandfathered) 시 기존 방식(plan 기반 추출) 유지 |
| 5 (G2) | **Plan+CL 사용자 검토**: Post-Plan Q/A에서 `AskUserQuestion`으로 사용자 승인 (dev-pipeline 위임) |
| 6 (G3) | **_index.md Documents 테이블 갱신**: Plan, Checklist 행의 경로와 상태를 갱신 |
| 7 (G3) | **Linear comment 기록**: Linear MCP로 Plan 완료 요약 comment (태스크 수, 주요 설계 결정 1~2줄) |
| 8 (G4) | **완료 반환**: plan.md + cl.md 생성 완료. 리뷰는 dev-pipeline의 Post-Plan Q/A에서 처리 |

---

## FR→S3 파생 매핑 규칙

> Spec의 EARS 형식 FR이 존재할 경우, S3 검증 항목 초안을 아래 규칙으로 자동 파생. plan.md 3a Traceability 테이블과 일관성 유지.

| EARS 패턴 | S3 검증 항목 변환 |
|-----------|-----------------|
| When {trigger} ... shall {action} | 검증 항목: {trigger} 시, 기대 결과: {action} 수행됨 |
| While {state} ... shall {action} | 검증 항목: {state} 중, 기대 결과: {action} 지속됨 |
| If {condition} ... shall {action} | 검증 항목: {condition} 재현, 기대 결과: {action} 수행됨 |
| Where {constraint} ... shall {action} | 검증 항목: {constraint} 경계값, 기대 결과: 범위 내 동작 |
| The system shall {action} | 검증 항목: {action} 확인, 기대 결과: 항상 수행됨 |

> **Spec 미존재 시**: `_index.md` Documents에 Spec 행 없음 → FR-ID 파생 스킵. S3은 plan Approach 기반으로 작성 (기존 동작).
> **Grandfathered spec**: Spec 존재하나 FR-ID 미보유 → 동일하게 스킵. S3 FR-ID 컬럼에 `--` 기입.

## Output

| 항목 | 내용 |
|------|------|
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` |
| cl.md | `docs/issue/{LINEAR-ID}/cl.md` |
| _index.md | Documents 테이블 갱신 |
| Linear comment | Plan 완료 요약 기록 |

---

## plan.md 구조

> plan.md 템플릿 + type별 작성 범위: [templates/plan-template.md](templates/plan-template.md)

---

## cl.md 구조

> cl.md 템플릿 + 태스크 ID 형식: [templates/checklist-template.md](templates/checklist-template.md)

---

## OMC 에이전트 연동

> gen-plan 자체는 에이전트 연동 없음. Plan 리뷰는 dev-pipeline의 Post-Plan Q/A에서 `oh-my-claudecode:critic` 사용.

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Issue description·type·relations 조회 | 플랜 작성 전 1회 |
| Plan 완료 요약 comment | 태스크 수 + 주요 설계 결정 1~2줄 |
| CL S1 태스크를 Sub-issue로 미러링 | best-effort. 실패 시 진행 중단 안 함 |
