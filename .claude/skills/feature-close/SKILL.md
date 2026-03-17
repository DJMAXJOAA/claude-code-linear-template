# feature-close — 완료 처리

verify PASS 후(feature/improvement/bug) 또는 research 완료 후 호출되어, `_index.md`에 구현 결과를 기록하고 Linear Issue를 Done으로 전이한다.

## Trigger

- dev-pipeline에서 verify PASS 감지 후 자동 호출 (feature, improvement, bug)
- research type의 조사 완료 후 호출

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
| 1 | **구현 결과 수집**: plan.md 설계 결정 vs 실제 구현 비교. 설계 이탈, 미해결 이슈, 실제 인터페이스 요약 수집. bug/research는 수정/조사 결과 요약 |
| 2 | **_index.md에 "구현 결과" 섹션 lazy-create**: 아래 §구현 결과 섹션 템플릿으로 생성. 이미 존재하면 갱신 |
| 3 | **G2 (검토)**: 구현 결과 요약을 사용자에게 제시 → `AskUserQuestion`으로 확인 |
| 4 | **Linear 상태 전이**: Linear MCP로 State → Done |
| 5 | **Linear comment 기록**: Linear MCP로 완료 요약 기록 (구현 결과 1~3줄 요약 + 설계 이탈 유무 + 미해결 이슈 유무) |
| 6 | **후행 Issue 참조 환류**: 아래 §후행 Issue 환류 참조 |

## Output

| 항목 | 내용 |
|------|------|
| _index.md | `## 구현 결과` 섹션 생성/갱신 |
| Linear | State → Done |
| Linear comment | 완료 요약 기록 |
| 후행 Issue | _index.md Notes 환류 메시지 + Linear comment (대상 존재 시) |

---

## 구현 결과 섹션 템플릿

`_index.md`의 `## 구현 결과` 섹션에 삽입:

```markdown
## 구현 결과

| 항목 | 내용 |
|------|------|
| 실제 구현 인터페이스 | {요약} |
| 설계 대비 차이점 | {차이점 또는 "없음"} |
| 미해결 이슈 | {이슈 목록 또는 "없음"} |
| 완료일 | {YYYY-MM-DD} |
```

### type별 구현 결과 내용

| type | 구현 결과 기록 내용 |
|------|------------------|
| feature | 실제 인터페이스, 설계 이탈, 미해결 이슈 |
| improvement | 변경 범위 요약, 설계 이탈 |
| bug | Root Cause, 수정 방법, 영향 범위 |
| research | 조사 결과 요약, 핵심 발견사항, 후속 작업 제안 |

---

## 후행 Issue 환류

| 단계 | 행위 |
|------|------|
| 6-1 | Linear MCP로 현재 Issue의 relations 조회 → `blocked-by` 역참조 Issue 목록 수집 |
| 6-2 | 각 후행 Issue의 `docs/{type}/{ID}/` 존재 확인 |
| 6-3 | 존재 시: `_index.md > ## Notes > ### Checkpoints` 섹션에 환류 메시지 append |
| 6-4 | 환류 메시지 형식: `- [REF] {LINEAR-ID} 완료 — {1줄 요약}. [Linear]({URL})` |
| 6-5 | Linear MCP: 후행 Issue에 comment 추가 — `Blocked-by {LINEAR-ID} 완료. 상세: docs/{type}/{LINEAR-ID}/_index.md` |

---

## G3-terminal 스킬 패턴

| 항목 | 내용 |
|------|------|
| 정의 | G1→G2→G3으로 완결. G4는 후속 Skill의 자체 게이트 사이클에 위임 |
| 특징 | 스킬 자체는 Git 기록 + Linear 갱신(G3)으로 완료 |

> pipeline.md §2-4 참조

---

## 현행 대비 주요 변경

| 항목 | 현행 | 신규 |
|------|------|------|
| 구현 결과 기록 위치 | Hub `## 구현 결과` 섹션 | `_index.md` `## 구현 결과` 섹션 |
| 상태 갱신 | Hub frontmatter `status: done` | Linear State → Done |
| 완료 요약 | Hub Status Log에 기록 | Linear comment에 기록 |
| 후행 Feature 탐색 | `backlogs/features.md` 활성 목록 확인 | Linear relations `blocked-by` 역참조 |
| 후행 Feature 환류 | Hub Notes > Checkpoints append | `_index.md > ## Notes > ### Checkpoints` append + Linear comment |

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| 상태 전이 | `save_issue` (id 지정) | State → Done |
| 완료 요약 기록 | `save_comment` | 구현 결과 요약 comment |
| 후행 Issue 탐색 | `list_issues` (relation 필터) | blocked-by 역참조 Issue 조회 (다수 검색) |
| 후행 Issue 알림 | `save_comment` | 환류 알림 comment |
