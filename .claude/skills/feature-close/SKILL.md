# feature-close — 완료 처리

verify PASS 후(feature/improvement/bug) 호출되어, `_index.md`에 구현 결과를 기록하고 Linear Issue를 Done으로 전이한다. 최종 상태를 Linear description에 1회성 미러링한다.

## Trigger

- In Review에서 사용자 승인 후 자동 호출 (전 type 공통)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 완료 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, SC), type, relations |
| _index.md | `docs/issue/{LINEAR-ID}/_index.md` — 기존 문서 확인 (feature/improvement만. bug는 없음) |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` — 설계 결정 비교 대상 (feature/improvement만. bug는 없음) |
| cl.md | `docs/issue/{LINEAR-ID}/cl.md` — 태스크 완료 상태 확인 (feature/improvement만. bug는 없음) |
| 검증 결과 | verify Skill 산출물 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **구현 결과 수집**: plan.md 설계 결정 vs 실제 구현 비교. 설계 이탈, 미해결 이슈, 실제 인터페이스 요약 수집 |

> **bug / improvement-light 축약 경로**: bug 및 improvement + Size: light (description Overview 기반)는 단계 1→3→4→5만 수행. (1) Linear comment에서 수정 결과 요약 수집, (3) 사용자 확인, (4) State → Done, (5) Linear comment 기록. 단계 2(_index.md 갱신), 5a(description 미러링 — SC 충족만 간략 반영), 6(후행 Issue 환류), 7(spec 연동)은 bug/improvement-light에서 스킵.
> **improvement-standard 경로**: _index.md가 존재하므로 기존 improvement 경로(단계 1~6) 유지. 단, spec 연동(§7)은 스킵 (improvement는 spec과 직접 연동하지 않음).
| 2 (G1) | **_index.md에 "구현 결과" 섹션 lazy-create**: 아래 §구현 결과 섹션 템플릿으로 생성. 이미 존재하면 갱신 |
| 3 (G2) | **검토**: 구현 결과 요약을 사용자에게 제시 → `AskUserQuestion`으로 확인 |
| 4 (G3) | **Linear 상태 전이**: Linear MCP로 State → Done |
| 5 (G3) | **Linear comment 기록**: Linear MCP로 완료 요약 기록 (구현 결과 1~3줄 요약 + 설계 이탈 유무 + 미해결 이슈 유무) |
| 5a (G3) | **Linear description 최종 미러링**: 아래 §Linear description 미러링 참조 |
| 6 (G3) | **후행 Issue 참조 환류**: 아래 §후행 Issue 환류 참조 |
| 7 (G3) | **spec 연동 갱신**: 아래 §spec 연동 갱신 참조 |

## Output

| 항목 | 내용 |
|------|------|
| _index.md | `## 구현 결과` 섹션 생성/갱신 |
| Linear | State → Done |
| Linear comment | 완료 요약 기록 |
| Linear description | 최종 상태 미러링 (1회성 스냅샷) |
| 후행 Issue | _index.md Notes 환류 메시지 + Linear comment (대상 존재 시) |
| spec 문서 | Related Issues + Change Log 갱신 (링크된 spec 존재 시) |

---

## 구현 결과 섹션 템플릿

> 구현 결과 템플릿 + type별 기록 내용: [templates/implementation-result.md](templates/implementation-result.md)

---

## Linear description 미러링

feature-close 시 _index.md의 최종 처리 내용을 Linear Issue description에 1회성 스냅샷으로 반영한다.

### 미러링 규칙

| 규칙 | 내용 |
|------|------|
| 1회성 | feature-close 시점에 1회만 실행. 이후 Linear description 재갱신 금지 |
| 스냅샷 성격 | "최종 처리 결과 스냅샷"으로 명시. 진행 중 상태 복제가 아님 |
| Git이 원천 | Decisions/구현 결과의 SSOT는 여전히 _index.md. Linear는 읽기 편의용 사본 |

### 미러링 대상

| description 섹션 | 미러링 행동 |
|-----------------|------------|
| Success Criteria | 검증 결과 반영 (충족/미충족/부분 충족) |
| Documents | 최종 경로 확정 (미생성 → 실제 경로 + 설명) |
| + Decisions Summary | _index.md `## Decisions` 섹션 내용 요약 추가 (있을 때만) |
| + Implementation Result | 구현 결과 테이블 요약 추가 |
| + Key Notes | _index.md `## Notes`에서 핵심 항목만 추가 (있을 때만) |

> 미러링 섹션은 요약 수준으로 유지. 상세 내용은 Git 문서 경로로 안내.

---

## 후행 Issue 환류

| 단계 | 행위 |
|------|------|
| 6-1 | Linear MCP로 현재 Issue의 relations 조회 → `blocked-by` 역참조 Issue 목록 수집 |
| 6-1a | **조기 종료**: relations가 없거나 `blocked-by` 역참조가 없으면 환류 없이 완료 처리 종료 |
| 6-2 | 각 후행 Issue의 `docs/issue/{ID}/` 존재 확인 |
| 6-3 | 존재 시: `_index.md > ## Notes > ### Checkpoints` 섹션에 환류 메시지 append |
| 6-4 | 환류 메시지 형식: `- [REF] {LINEAR-ID} 완료 — {1줄 요약}. [Linear]({URL})` |
| 6-5 | Linear MCP: 후행 Issue에 comment 추가 — `Blocked-by {LINEAR-ID} 완료. 상세: docs/issue/{LINEAR-ID}/_index.md` |

---

## spec 연동 갱신

| 단계 | 행위 |
|------|------|
| 7-1 | `_index.md` Documents 테이블에서 Spec 행 확인. 없으면 스킵 |
| 7-2 | spec 디렉토리 (`docs/spec/{spec-name}/`) 존재 확인. 경로/링크 없으면 무시 (필수 아님) |
| 7-3 | spec `_index.md` 로드 → `## Related Issues` 테이블에 현재 Issue 완료 상태 갱신 |
| 7-4 | 구현 결과에서 spec 변경이 필요한 내용 감지 (설계 이탈, 추가 요구사항 등) |
| 7-5 | 변경 필요 시: `AskUserQuestion`으로 spec 갱신 내용 확인 → 승인 시 spec 문서 갱신 |
| 7-6 | spec `_index.md`의 `## Change Log`에 변경 이력 추가. 확장된 4-컬럼 형식(날짜/FR-ID/변경유형/변경내용) 사용, 영향 FR-ID 특정 (spec-template.md 참조) |
| 7-7 | spec frontmatter `updated` 날짜 갱신 |
| 7-8 | `docs/spec/_index.md` 글로벌 목록 테이블 자동 갱신 |

> spec 전체 로드 대신 `_index.md`의 Related Issues + Change Log 섹션만 선택적 로드 (컨텍스트 절약). 경로/링크 없으면 무시.

---

## G3-terminal 스킬 패턴

> pipeline.md §2-4 참조

---

## OMC 에이전트 연동

> feature-close 자체는 에이전트 연동 없음.

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| State → Done 전이 | G3 단계 |
| 구현 결과 요약 comment | 완료 처리 시 |
| description 최종 상태 미러링 | 1회성 스냅샷 |
| blocked-by 역참조 Issue 조회 | 후행 Issue 환류용 |
| 후행 Issue에 환류 알림 comment | 대상 존재 시 |
