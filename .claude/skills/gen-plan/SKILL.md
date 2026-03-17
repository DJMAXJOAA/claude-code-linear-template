# gen-plan — plan.md + cl.md 생성

dev-pipeline에서 Planning 단계 진입 시 호출되어, `docs/{type}/{LINEAR-ID}/plan.md`와 `cl.md`를 동시 생성한다.

## Trigger

- dev-pipeline에서 Planning 단계 진입 시 (feature: Backlog→Planning, improvement: Backlog→Planning)
- Pre-Plan Q/A 완료 후 자동 호출

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, SC), type, labels, relations |
| _index.md | `docs/{type}/{LINEAR-ID}/_index.md` — 기존 문서 목록 확인 |
| 코드베이스 조사 결과 | Pre-Plan Q/A Phase 0에서 수집된 관련 파일, 아키텍처 가이드 |
| How 인터뷰 결과 | Pre-Plan Q/A Phase 1에서 확정된 SC, 스펙, Decisions, 리스크, 범위 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **Linear Issue 정보 읽기**: Linear MCP로 description(Overview, SC), type, relations 조회 |
| 2 (G1) | **Related Issue Known Limitations 교차 참조**: Linear relations에서 related/blocked-by Issue 목록 수집 → 해당 Issue의 `docs/{type}/{ID}/_index.md`에서 `## 구현 결과` 섹션 읽기 → 설계 이탈, 미해결 이슈 확인 |
| 3 (G1) | **plan.md 작성**: 아래 §plan.md 구조에 따라 작성. type에 따라 작성 범위 결정 |
| 4 (G1) | **cl.md 작성**: 아래 §cl.md 구조에 따라 작성. Plan의 접근 방식에서 태스크 추출 |
| 5 (G2) | **Plan+CL 사용자 검토**: Post-Plan Q/A에서 `AskUserQuestion`으로 사용자 승인 (dev-pipeline 위임) |
| 6 (G3) | **_index.md Documents 테이블 갱신**: Plan, Checklist 행의 경로와 상태를 갱신 |
| 7 (G3) | **Linear 상태 전이**: Linear MCP로 State → Planning |
| 8 (G4) | **완료 반환**: plan.md + cl.md 생성 완료. 리뷰는 dev-pipeline의 Post-Plan Q/A에서 처리 |

## Output

| 항목 | 내용 |
|------|------|
| plan.md | `docs/{type}/{LINEAR-ID}/plan.md` |
| cl.md | `docs/{type}/{LINEAR-ID}/cl.md` |
| _index.md | Documents 테이블 갱신 |
| Linear | State → Planning |

---

## plan.md 구조

> plan.md 템플릿 + type별 작성 범위: [templates/plan-template.md](templates/plan-template.md)

---

## cl.md 구조

> cl.md 템플릿 + 태스크 ID 형식: [templates/checklist-template.md](templates/checklist-template.md)

---

## OMC 에이전트 연동

> gen-plan 자체는 에이전트 연동 없음. Plan 리뷰는 dev-pipeline의 Post-Plan Q/A에서 `oh-my-claudecode:critic` 사용.

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Issue 정보 조회 | `get_issue` | description, type, relations 읽기 (단일 Issue) |
| 상태 전이 | `save_issue` (id 지정) | State → Planning |
| Sub-issue 생성 (best-effort) | `save_issue` (parentId 지정) | CL S1 태스크를 Linear Sub-issue로 미러링. 실패 시 진행 중단 안 함 |
