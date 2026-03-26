---
name: gen-hub
description: "Linear Issue 생성 및 Git docs/issue 폴더 + _index.md 생성. /등록 커맨드 또는 Issue 등록 요청 시 호출."
---

# gen-hub — _index.md + Linear Issue 생성

`/등록` 커맨드에서 호출되어, Linear Issue를 생성하고 Git에 `docs/issue/{LINEAR-ID}/` 폴더 + `_index.md`를 생성한다.

## Trigger

- `/등록` 커맨드 호출 시
- 사용자가 직접 Issue 등록을 요청할 때

## Input

| 항목 | 설명 |
|------|------|
| 제목 | Issue 제목 |
| 설명 | What + Why (1~3문장) |
| type | `feature` / `bug` / `improvement` — 사용자 지정 또는 AI 추천 |
| 태그 | Linear Label로 등록할 태그 목록. AI가 컨텍스트 기반 추천 → 사용자 승인 |
| 마일스톤 | Linear Project에 매핑할 마일스톤 (선택) |
| Priority | High / Medium / Low (선택, 기본값: Medium) |
| 참조 문서 | 관련 spec 문서, 스크립트, 설정 등의 경로 (선택, 복수 가능). 예: `docs/spec/combat-system/`, `scripts/migrate.ts` |
| `--from-spec` | (선택) `docs/spec/{spec-name}` 디렉토리 경로. 지정 시 spec의 FR을 기반으로 Issue 배치 생성 |

## Process

### --from-spec 배치 모드

> `--from-spec` 옵션 지정 시 아래 프로세스 실행. 미지정 시 기존 단건/배치 등록 프로세스(아래) 실행.

| 단계 | 행위 |
|------|------|
| 0a | **Spec 로드**: `--from-spec` 경로의 `_index.md` + `requirements.md` 로드. FR 테이블에서 FR-ID 목록 수집 |
| 0b | **FR 그루핑 제안**: FR-ID를 Issue 단위로 그루핑(도메인/의존성 기반) → `AskUserQuestion`으로 사용자 확인/수정 |
| 0c | **배치 실행**: 승인된 그룹별로 기존 G0~G3 프로세스 반복. Label/Project 조회는 G0에서 1회 캐싱하여 재사용 |

| 규칙 | 내용 |
|------|------|
| FR 그루핑 | AI가 도메인/의존성 기반 제안. 사용자 최종 결정 |
| Issue description | Spec Summary에 FR-ID 목록 포함. Documents에 spec 경로 자동 삽입 |
| relation 자동 설정 | 같은 spec 출처 Issue 간 `relatedTo` 자동 설정 |

| 단계 | 행위 |
|------|------|
| 0 (G0) | **Linear 컨텍스트 조회**: `list_issue_labels` + `list_projects`를 **병렬** 호출하여 기존 Label/Project 목록 획득. 배치 모드에서 호출 시 캐싱 데이터가 전달되면 이 단계 생략 |
| 1 (G1) | **사용자 입력 수집**: `AskUserQuestion`으로 제목, 설명, type 수집. 태그는 G0에서 조회한 기존 Label 목록 기반으로 AI 추천 후 승인. 마일스톤은 기존 Project 목록 기반 추천. 참조 문서는 사용자 직접 지정 또는 AI가 `docs/spec/` 등 탐색 후 추천. **외부 호출자가 title/description/type을 전달한 경우 이 단계 생략** |
| 1a (G1) | **AI 추론**: 사용자 입력(제목+설명) 기반 초안 추론. feature/improvement: Spec Summary, Constraints, SC. bug: Acceptance Criteria만 |
| 2 (G2) | **type별 description 구성 + 사용자 확인**: 아래 §type별 description 템플릿에 따라 Linear Issue description 마크다운 조립 (Spec Summary + Constraints + Success Criteria 초안 포함) → `AskUserQuestion`으로 전체 내용 확인/수정. **외부 호출자가 사용자 승인을 완료한 경우(예: triage G2 Approval Table) 이 단계 생략** |
| 3 (G3) | **Linear Issue 생성**: Linear MCP로 Issue 생성 — title, description, labels(type + 태그), project(마일스톤), state: Todo |
| 4 (G3) | **Linear Issue ID 획득**: 응답에서 `PRJ-N` 형식의 ID + URL 추출 |
| 5 (G3) | **Git 폴더 생성**: `docs/issue/{LINEAR-ID}/` 디렉토리 생성 (**bug는 스킵**) |
| 6 (G3) | **_index.md 생성**: 아래 §_index.md 템플릿으로 파일 생성. Linear API 응답의 URL을 직접 사용 (수동 URL 조합 금지). 참조 문서가 있으면 Documents 테이블에 해당 행 추가 (**bug는 스킵**) |
| 7 (G3) | **Linear description에 Git 경로 삽입**: description의 `## Documents` 섹션에 `docs/issue/{LINEAR-ID}/_index.md` 경로 기록. 참조 문서 존재 시 해당 경로도 삽입 (**bug는 스킵** — Documents 섹션 자체 생략 또는 참조 문서만 기록) |

## 배치 등록 모드

### 트리거
- 사용자 입력이 여러 줄 텍스트, 문서 경로, 복수 기능/버그 서술인 경우
- `--from-spec` 옵션 지정 시

### Process (배치)

| 단계 | 행위 |
|------|------|
| B-0 | **Linear 컨텍스트 1회 캐싱**: `list_issue_labels` + `list_projects` 병렬 호출 |
| B-1 | **텍스트 분석**: 입력에서 이슈 후보 추출 |
| B-2 | **후보 목록 제시**: 아래 §후보 목록 형식으로 `AskUserQuestion` |
| B-3 | **일괄 생성**: 의존 관계 순서대로 단건 Process(G0~G3) 순차 호출. 캐싱 데이터 전달 |

### 후보 목록 형식

| # | type | 제목 | 설명 (요약) | priority | labels | project | 관계 |
|---|------|------|-------------|----------|--------|---------|------|

### 이슈 관계 설정

| 관계 유형 | 문법 | 설명 |
|-----------|------|------|
| `blockedBy` | `blockedBy: #2` 또는 `blockedBy: PRJ-42` | 선행 작업 |
| `blocks` | `blocks: #3` | 후속 차단 |
| `relatedTo` | `relatedTo: #1, PRJ-42` | 관련 이슈 |
| `parentId` | `parent: #1` 또는 `parent: PRJ-42` | 상위 이슈 |

> `#N`은 배치 내 번호 참조. 생성 후 실제 Linear ID로 치환.

### 제약

- 한 번에 최대 **10건**까지 등록. 초과 시 분할 안내
- 순환 의존(A→B→A) 감지 시 사용자에게 경고 후 관계 수정 요청
- `blockedBy`/`blocks` 관계가 있으면 선행 이슈를 먼저 생성하도록 순서 자동 정렬

---

## Output

| 항목 | 내용 |
|------|------|
| Linear Issue | Todo 상태의 새 Issue (type Label 부착) |
| Git 파일 | `docs/issue/{LINEAR-ID}/_index.md` (bug는 미생성) |

---

> type별 description 템플릿: [templates/issue-descriptions.md](templates/issue-descriptions.md)

---

> _index.md 템플릿 (SSOT): [templates/index-templates.md](templates/index-templates.md)

---

## OMC 에이전트 연동

> gen-hub 자체는 에이전트 연동 없음.

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| Label 목록 조회 | G0 단계, 태그 추천 기반. Project 조회와 **병렬** 호출 |
| Project 목록 조회 | G0 단계, 마일스톤 추천 기반. 배치 모드 캐싱 시 생략 |
| Team ID 확인 | 필요 시 |
| Issue 생성 | title, description, labels, project, state, 관계 지정 |
| description에 Documents 경로 삽입 | Issue 생성 후 |
