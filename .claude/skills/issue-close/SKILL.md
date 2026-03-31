---
name: issue-close
description: "verify PASS 후 완료 처리(전 type 공통). progress.txt 기반 완료 처리. Linear comment + plan.md Outcome 기록 후 Done 전이."
---

# issue-close — 완료 처리 (전 type 공통)

verify PASS 후(feature/improvement/bug) 호출되어, 구현 결과를 Linear Changes + comments + plan.md Outcome에 기록하고, Linear Issue를 Done으로 전이한다.

## Trigger

- In Review에서 사용자 승인 후 자동 호출 (전 type 공통)

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 완료 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, SC), type, relations |
| plan.md | `docs/issue/{LINEAR-ID}/plan.md` — Tasks 완료 상태 확인 + Outcome 기록 대상 (**feature/improvement-standard만**) |
| 검증 결과 | verify Skill 산출물 |
| 참조 문서 목록 | Linear description Documents 섹션에서 추출한 참조 경로 목록 |

## Process

### type별 경로 분기

| type | 실행 단계 | plan.md Outcome | description 미러링 | 후행 환류 | spec 연동 |
|------|----------|----------------|--------------------|----------|----------|
| **feature** | 1→2→3→4→5→5a→6→7→8 (전체) | ✅ 기록 | ✅ | ✅ | ✅ |
| **improvement-standard** | 1→2→3→4→5→5a→6→7→8 | ✅ 기록 | ✅ | ✅ | ✅ (Spec 참조 존재 시) |
| **improvement-light** | 1→2→4→5→**6**→8 | ❌ 없음 | ❌ | ✅ (blocked-by 역참조 존재 시) | ❌ |
| **bug** | 1→2→4→5→**6**→8 | ❌ (plan.md 없으면) | ❌ | ✅ (blocked-by 역참조 존재 시) | ❌ |

### 단계별 프로세스

| 단계 | 행위 |
|------|------|
| 1 (G1) | **구현 결과 수집**: type별 소스에서 구현 결과를 수집한다. 아래 §구현 결과 수집 참조 |
| 2 (G2) | **자동 진행**: 구현 결과 요약을 로그로 출력하고 즉시 다음 단계로 진행. 별도 사용자 승인 불필요 |
| 3 (G3) | **plan.md Outcome 기록**: plan.md가 존재하는 type만 수행 (feature/improvement-standard). Outcome 섹션에 구현 결과 요약 기록 |
| 4 (G3) | **Linear 상태 전이**: Linear MCP로 State → Done |
| 5 (G3) | **Linear comment 기록**: Linear MCP로 완료 요약 기록. 아래 §Linear comment 참조 |
| 5a (G3) | **Linear description 최종 미러링**: 아래 §Linear description 미러링 참조 |
| 6 (G3) | **후행 Issue 참조 환류**: 아래 §후행 Issue 환류 참조 |
| 7 (G3) | **spec 메타데이터 연동 갱신**: 아래 §spec 연동 갱신 참조 |
| 8 (G3) | **참조 문서 내용 동기화**: 아래 §참조 문서 내용 동기화 참조 (전 type 공통) |

## Output

| 항목 | 적용 type | 내용 |
|------|----------|------|
| plan.md Outcome | feature, improvement-standard | `## Outcome` 섹션에 구현 결과 요약 기록 |
| Linear | 전 type | State → Done |
| Linear comment | 전 type | 완료 요약 + Git 작업 기록 |
| Linear description | feature, improvement-standard | 최종 상태 미러링 (1회성 스냅샷) |
| 후행 Issue | feature, improvement-standard | Linear comment 환류 메시지 (대상 존재 시) |
| spec 문서 | feature, improvement-standard | Change Log 갱신 (링크된 spec 존재 시) |
| 참조 문서 | 전 type | Documents/Reference에 등록된 .md 문서 내용 갱신 (구현 결과 반영) |

---

## 구현 결과 수집

type에 따라 수집 소스가 다르다.

| type | 수집 소스 | 수집 내용 |
|------|----------|----------|
| feature | plan.md 설계 결정 vs 실제 구현 비교 | 설계 이탈, 미해결 이슈, 실제 인터페이스 요약 |
| improvement-standard | plan.md 설계 결정 vs 실제 구현 비교 | 변경 범위 요약, 설계 이탈 |
| improvement-light | Linear description + comment + Git 커밋 이력 | 변경 요약, 영향 범위 |
| bug | Linear description + comment + Git 커밋 이력 | Root Cause, 수정 방법, 영향 범위 |

> **bug/improvement-light**: plan.md가 없을 수 있으므로 Linear comment(수정 결과 요약)과 `git log`(관련 커밋)에서 구현 결과를 수집한다.

---

## Linear comment

전 type 공통으로 Linear comment에 완료 요약을 기록한다.

### comment 포함 내용

| 항목 | 적용 type | 설명 |
|------|----------|------|
| 구현 결과 요약 | 전 type | 1~3줄 요약 |
| 설계 이탈 유무 | feature, improvement-standard | plan.md 대비 차이점 |
| 미해결 이슈 유무 | 전 type | 후속 작업 필요 여부 |
| **Git 작업 기록** | 전 type | 관련 커밋 목록 (hash + message). `git log --oneline`에서 해당 Issue 관련 커밋 추출 |

### Git 작업 기록 수집

| 단계 | 행위 |
|------|------|
| 1 | `git log --oneline`에서 Linear ID 또는 관련 키워드가 포함된 커밋 필터링 |
| 2 | 커밋이 없으면 현재 브랜치의 최근 커밋 중 파이프라인 진행 기간 내 커밋을 수집 |
| 3 | comment에 `### Git Log` 섹션으로 포함 (최대 10건) |

### comment 형식 예시

```
## 완료 요약
{구현 결과 1~3줄 요약}

- 설계 이탈: {유/무 + 요약}
- 미해결 이슈: {유/무 + 목록}

### Git Log
- `abc1234` feat: add user authentication
- `def5678` test: add auth unit tests
- `ghi9012` fix: handle edge case in token refresh
```

---

## Linear description 미러링

issue-close 시 plan.md Outcome + 구현 결과를 Linear Issue description에 1회성 스냅샷으로 반영한다.

> **적용 대상**: feature, improvement-standard만. bug/improvement-light는 plan.md가 없으므로 스킵.

### 미러링 규칙

| 규칙 | 내용 |
|------|------|
| 1회성 | issue-close 시점에 1회만 실행. 이후 Linear description 재갱신 금지 |
| 스냅샷 성격 | "최종 처리 결과 스냅샷"으로 명시. 진행 중 상태 복제가 아님 |
| Git이 원천 | 설계/구현 결과의 SSOT는 여전히 Git(spec.md/plan.md/technical.md). Linear는 읽기 편의용 사본 |

### 미러링 대상

| description 섹션 | 미러링 행동 |
|-----------------|------------|
| Success Criteria | SC 체크 처리 (아래 §SC 체크 처리 참조) |
| Documents | 최종 경로 확정 (미생성 → 실제 경로 + 설명) |
| + Decisions Summary | spec.md 설계 결정 내용 요약 추가 (있을 때만) |
| + Implementation Result | plan.md Outcome 요약 추가 |
| + Key Notes | progress.txt에서 핵심 항목만 추가 (있을 때만) |

> 미러링 섹션은 요약 수준으로 유지. 상세 내용은 Git 문서 경로로 안내.

### SC 체크 처리

issue-close 시 Linear Issue description의 Success Criteria 체크박스를 최종 갱신한다.

| 항목 | 내용 |
|------|------|
| 대상 | Linear Issue description `## Success Criteria` 섹션의 체크박스 항목 |
| 동작 | verify PASS로 충족 확인된 SC 항목을 `- [ ]` → `- [x]`로 체크 처리 |
| 미충족 항목 | `- [ ]` 유지 + 사유 인라인 주석 (예: `- [ ] SC 3 <!-- 부분 충족: 사유 -->`) |
| 적용 type | **전 type 공통**. feature/improvement-standard는 미러링(5a)에서 수행, bug/improvement-light는 별도 `save_issue`로 SC만 갱신 |
| 갱신 시점 | 단계 5a (미러링 대상 type) 또는 단계 5 직후 (미러링 비대상 type) |
| triage 선행 체크 | triage에서 이미 `- [x]` 처리된 항목은 유지. 단, **verify가 FAIL 판정한 SC는 `- [x]` → `- [ ]`로 되돌림** (verify 결과가 triage 선행 체크보다 우선) |

---

## 후행 Issue 환류

> **적용 대상**: 전 type (blocked-by 역참조 존재 시). feature/improvement-standard는 항상 수행. bug/improvement-light는 blocked-by 역참조가 존재하는 경우에만 수행.

| 단계 | 행위 |
|------|------|
| 6-1 | Linear MCP로 현재 Issue의 relations 조회 → `blocked-by` 역참조 Issue 목록 수집 |
| 6-1a | **조기 종료**: relations가 없거나 `blocked-by` 역참조가 없으면 환류 없이 완료 처리 종료 |
| 6-2 | Linear MCP: 후행 Issue에 환류 comment 추가 — `Blocked-by {LINEAR-ID} 완료 — {1줄 요약}. docs/issue/{LINEAR-ID}/` |

---

## spec 연동 갱신

> **적용 대상**: feature, improvement-standard. Linear description Documents 섹션에 Spec 행이 존재하는 경우에만 실행. bug/improvement-light는 스킵.

| 단계 | 행위 |
|------|------|
| 7-1 | Linear description Documents 섹션에서 Spec 행 확인. 없으면 스킵 |
| 7-2 | spec 디렉토리 (`docs/spec/{spec-name}/`) 존재 확인. 경로/링크 없으면 무시 (필수 아님) |
| 7-3 | spec `_index.md`의 `## Change Log`에 변경 이력 추가. 확장된 4-컬럼 형식(날짜/FR-ID/변경유형/변경내용) 사용, 영향 FR-ID 특정 (spec-template.md 참조) |
| 7-4 | spec frontmatter `updated` 날짜 갱신 |
| 7-5 | `docs/spec/_index.md` 글로벌 목록 테이블 자동 갱신 |

> spec 본문 갱신(`requirements.md`, `technical.md` 등)은 §8 참조 문서 내용 동기화에서 통합 처리. §7은 메타데이터(Change Log, frontmatter) 전용.
> spec 전체 로드 대신 `_index.md`의 Change Log 섹션만 선택적 로드 (컨텍스트 절약). 경로/링크 없으면 무시.

---

## 참조 문서 내용 동기화

전 type 공통으로, Documents/Reference에 등록된 참조 문서의 **내용**을 구현 결과에 맞게 갱신한다. 환류 시 문서와 실제 구현 간 불일치를 방지하는 것이 목적이다.

### 참조 문서 수집 소스

| type | 수집 소스 | 비고 |
|------|----------|------|
| feature | Linear description Documents 섹션 + `plan.md` §3a Traceability | hub + FR→Task 매핑 |
| improvement-standard | Linear description Documents 섹션 | hub 기반 |
| improvement-light | Linear description Documents 섹션 | Git 문서 없음 → Linear에서 파싱 |
| bug | Linear description Documents 섹션 | Git 문서 없음 → Linear에서 파싱. Documents 섹션 없으면 즉시 스킵 |

### 갱신 대상 필터링

| 조건 | 행동 |
|------|------|
| 경로가 `.md` 파일 또는 spec 디렉토리 (`docs/spec/{name}/`) | 갱신 대상 ✅ |
| 경로가 코드 파일, 외부 URL, 비존재 파일 | 스킵 ❌ |
| spec 디렉토리 참조 | `requirements.md` + `technical.md` + `roadmap.md`(존재 시)를 개별 갱신 대상으로 전개 |
| Index 행 (spec `_index.md`), Plan, Checklist, progress.txt | 스킵 (이미 다른 단계에서 처리) |

### 단계별 프로세스

| 단계 | 행위 |
|------|------|
| 8-1 | **참조 문서 수집**: type별 소스에서 Documents/Reference 경로 추출 |
| 8-2 | **갱신 대상 필터링**: 위 필터링 규칙 적용. `.md` 파일 + 파일 존재 확인 |
| 8-3 | **조기 종료**: 갱신 대상이 0건이면 스킵하고 완료 |
| 8-4 | **문서별 불일치 분석**: 각 대상 문서를 선택적 로드하고, §1에서 수집한 구현 결과(설계 이탈, 실제 인터페이스, 미해결 이슈)와 비교하여 갱신 필요 항목 도출 |
| 8-5 | **갱신 내용 자동 승인**: 문서별 갱신 요약을 로그로 출력하고 즉시 갱신 수행. 별도 사용자 확인 불필요 |
| 8-6 | **문서 갱신 수행**: 승인된 항목만 실제 파일 수정 |
| 8-7 | **spec 추가 처리**: spec 문서 갱신 시 Change Log에 이력 추가 (§7 Change Log와 중복 방지 — §7에서 이미 기록한 항목은 스킵), frontmatter `updated` 갱신 |

### spec 문서 갱신 시 비교 기준

| spec 파일 | 비교 대상 | 갱신 예시 |
|-----------|----------|----------|
| `requirements.md` | FR과 실제 구현의 차이 | 추가/변경/삭제된 요구사항 반영, EARS 패턴 갱신 |
| `technical.md` | 기술 설계 vs 실제 구현 | 인터페이스 시그니처, 아키텍처 변경, 데이터 모델 갱신 |
| `roadmap.md` | 완료 항목 | 구현 완료된 항목 상태 반영 (존재하는 경우만) |

> **컨텍스트 절약**: 참조 문서는 갱신 대상만 선택적 로드. spec은 변경 가능성 있는 섹션 위주로 로드. 대량 참조 시 우선순위: spec > 기타 문서.

---

## G3-terminal 스킬 패턴

> pipeline.md §2-4 참조

---

## OMC 에이전트 연동

> issue-close 자체는 에이전트 연동 없음.

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 적용 type | 상세 |
|------|----------|------|
| State → Done 전이 | 전 type | G3 단계 |
| 구현 결과 요약 + Git 작업 기록 comment | 전 type | 완료 처리 시 |
| description 최종 상태 미러링 | feature, improvement-standard | 1회성 스냅샷 |
| blocked-by 역참조 Issue 조회 | feature, improvement-standard | 후행 Issue 환류용 |
| 후행 Issue에 환류 comment | feature, improvement-standard | 대상 존재 시 (`Blocked-by {ID} 완료 — {요약}. docs/issue/{ID}/`) |
| description Documents 섹션 읽기 | bug, improvement-light | 참조 문서 수집용 (§8) |
