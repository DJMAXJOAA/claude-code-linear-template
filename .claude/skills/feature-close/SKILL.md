# feature-close — 완료 처리

verify PASS 후(feature/improvement/bug) 호출되어, `_index.md`에 구현 결과를 기록하고 Linear Issue를 Done으로 전이한다.

## Trigger

- dev-pipeline에서 verify PASS 감지 후 자동 호출 (feature, improvement, bug)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 완료 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, SC), type, relations |
| _index.md | `docs/{type}/{LINEAR-ID}/_index.md` — 기존 문서 확인 |
| plan.md | `docs/{type}/{LINEAR-ID}/plan.md` — 설계 결정 비교 대상 (feature/improvement) |
| cl.md | `docs/{type}/{LINEAR-ID}/cl.md` — 태스크 완료 상태 확인 (feature/improvement) |
| 검증 결과 | verify Skill 산출물 또는 implement 간략 검증 결과 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **구현 결과 수집**: plan.md 설계 결정 vs 실제 구현 비교. 설계 이탈, 미해결 이슈, 실제 인터페이스 요약 수집. bug는 수정 결과 요약 |
| 2 (G1) | **_index.md에 "구현 결과" 섹션 lazy-create**: 아래 §구현 결과 섹션 템플릿으로 생성. 이미 존재하면 갱신 |
| 3 (G2) | **검토**: 구현 결과 요약을 사용자에게 제시 → `AskUserQuestion`으로 확인 |
| 4 (G3) | **Linear 상태 전이**: Linear MCP로 State → Done |
| 5 (G3) | **Linear comment 기록**: Linear MCP로 완료 요약 기록 (구현 결과 1~3줄 요약 + 설계 이탈 유무 + 미해결 이슈 유무) |
| 6 (G3) | **후행 Issue 참조 환류**: 아래 §후행 Issue 환류 참조 |
| 7 (G3) | **spec 연동 갱신**: 아래 §spec 연동 갱신 참조 |

## Output

| 항목 | 내용 |
|------|------|
| _index.md | `## 구현 결과` 섹션 생성/갱신 |
| Linear | State → Done |
| Linear comment | 완료 요약 기록 |
| 후행 Issue | _index.md Notes 환류 메시지 + Linear comment (대상 존재 시) |
| spec 문서 | Related Issues + Change Log 갱신 (링크된 spec 존재 시) |

---

## 구현 결과 섹션 템플릿

> 구현 결과 템플릿 + type별 기록 내용: [templates/implementation-result.md](templates/implementation-result.md)

---

## 후행 Issue 환류

| 단계 | 행위 |
|------|------|
| 6-1 | Linear MCP로 현재 Issue의 relations 조회 → `blocked-by` 역참조 Issue 목록 수집 |
| 6-1a | **조기 종료**: relations가 없거나 `blocked-by` 역참조가 없으면 환류 없이 완료 처리 종료 |
| 6-2 | 각 후행 Issue의 `docs/{type}/{ID}/` 존재 확인 |
| 6-3 | 존재 시: `_index.md > ## Notes > ### Checkpoints` 섹션에 환류 메시지 append |
| 6-4 | 환류 메시지 형식: `- [REF] {LINEAR-ID} 완료 — {1줄 요약}. [Linear]({URL})` |
| 6-5 | Linear MCP: 후행 Issue에 comment 추가 — `Blocked-by {LINEAR-ID} 완료. 상세: docs/{type}/{LINEAR-ID}/_index.md` |

---

## spec 연동 갱신

| 단계 | 행위 |
|------|------|
| 7-1 | `_index.md` Documents 테이블에서 Spec 행 확인. 없으면 스킵 |
| 7-2 | spec 문서 로드 → `## Related Issues` 테이블에 현재 Issue 완료 상태 갱신 |
| 7-3 | 구현 결과에서 spec 변경이 필요한 내용 감지 (설계 이탈, 추가 요구사항 등) |
| 7-4 | 변경 필요 시: `AskUserQuestion`으로 spec 갱신 내용 확인 → 승인 시 spec 문서 갱신 |
| 7-5 | spec 문서의 `## Change Log`에 변경 이력 추가 |
| 7-6 | spec frontmatter `updated` 날짜 갱신 |
| 7-7 | `docs/spec/_index.md` 목록 테이블의 수정일 자동 갱신 |

> spec 전체 로드 대신 Related Issues + Change Log 섹션만 선택적 로드 (컨텍스트 절약)

---

## G3-terminal 스킬 패턴

| 항목 | 내용 |
|------|------|
| 정의 | G1→G2→G3으로 완결. G4는 후속 Skill의 자체 게이트 사이클에 위임 |
| 특징 | 스킬 자체는 Git 기록 + Linear 갱신(G3)으로 완료 |

> pipeline.md §2-4 참조

---

## OMC 에이전트 연동

> feature-close 자체는 에이전트 연동 없음.

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| 상태 전이 | `save_issue` (id 지정) | State → Done |
| 완료 요약 기록 | `save_comment` | 구현 결과 요약 comment |
| 후행 Issue 탐색 | `list_issues` (relation 필터) | blocked-by 역참조 Issue 조회 (다수 검색) |
| 후행 Issue 알림 | `save_comment` | 환류 알림 comment |
