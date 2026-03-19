# spec — 기능 명세 생성 및 관리

`/스펙` 커맨드에서 호출되어, 고정된 파이프라인을 통해 유저 입력을 구조화된 SDD Spec 문서(들)로 변환한다. 조사 → 요구사항 인터뷰(프리필) → 문서 분할 구조 제안 → spec 문서 출력 → _index.md 자동 갱신 → Linear Document 생성(선택).

## Trigger

- `/스펙` 커맨드 호출 시
- 사용자가 "spec 작성", "명세 작성" 등을 요청할 때

## Input

| 항목 | 설명 |
|------|------|
| 기능 제목 | spec 대상 기능 이름 (사용자 입력) |
| 기능 설명 | What + Why (사용자 입력, 1~3문장) |
| 기존 spec | `docs/spec/` 내 기존 디렉토리 확인 (중복 방지 + 재호출 감지) |

## Process — 5-게이트 구조

모든 게이트에서 AI가 파악한 내용을 출력하고 유저 확인을 받은 후 다음으로 진행한다.

### G1. 범위 확정

| 단계 | 행위 |
|------|------|
| 1-1 | **기능 범위 확인**: `$ARGUMENTS`에서 제목 파싱. 없으면 `AskUserQuestion`으로 기능 제목 + 설명 수집 |
| 1-2 | **기존 spec 확인**: `docs/spec/` 탐색하여 중복/관련 spec 디렉토리 확인 |
| 1-3 | **재호출 감지**: 동일 이름 디렉토리 존재 시 기존 파일 목록 diff 제시 ("N개 문서 중 M개 대체, K개 삭제 예정") → 유저 확인 후 덮어쓰기 결정 |

> G1 출력: 기능 제목, 설명, 기존 spec 상태(신규/재호출/관련 존재) → `AskUserQuestion`으로 유저 확인

### G2. 조사 확인

| 단계 | 행위 |
|------|------|
| 2-1 | **코드베이스 조사**: `oh-my-claudecode:explore`로 관련 코드 탐색 + 기존 아키텍처 문서 참조 |
| 2-2 | **심층 조사 (선택)**: 외부 프로토콜/기술 스펙이 필요하면 `oh-my-claudecode:scientist` 위임 |

> G2 출력: 조사 결과 통합 요약 (관련 코드, 기존 구조, 외부 스펙) → `AskUserQuestion`으로 유저 확인

### G3. 요구사항 확정

| 단계 | 행위 |
|------|------|
| 3-1 | **프리필 인터뷰**: G2 조사 결과를 기반으로 인터뷰 항목을 프리필한 상태로 제시. 유저는 빈칸 채우기가 아닌 **리뷰/수정/보완 모드**로 확인 |

인터뷰 항목 (순차 확인):

| 순서 | 항목 | 필수 | 비고 |
|------|------|:----:|------|
| 1 | Functional Requirements | O | |
| 2 | Constraints & Dependencies | O | 기술 제약 + 외부 의존성 + 기존 코드 제약 |
| 3 | Technical Specifications | O | Constraints 분리 후 순수 기술 명세 집중 |
| 4 | Out of Scope | O | 경계 명확화. "이 spec이 다루지 않는 것" |
| 5 | Non-Functional Requirements | △ | 해당 시에만 |
| 6 | UI/UX Specifications | △ | 해당 시에만 |

> G3 출력: 프리필된 요구사항 전체 → `AskUserQuestion`으로 유저 확인/수정

### G4. 구조 + 초안

| 단계 | 행위 |
|------|------|
| 4-1 | **문서 분할 구조 제안**: G3 확정 요구사항을 기반으로 디렉토리 구조 제안 (`_index.md` + 하위 문서 N개, 도메인 단위 자유 분할) |
| 4-2 | **spec 초안 작성**: `templates/spec-template.md` 기반으로 `_index.md` + 하위 문서 초안을 동시 제시 |

> G4 출력: 디렉토리 구조 + 전체 초안 → `AskUserQuestion`으로 유저 검토

### G5. 저장 + 후속

| 단계 | 행위 |
|------|------|
| 5-1 | **spec 디렉토리 생성**: `docs/spec/{spec-name}/` 디렉토리 + `_index.md` + 하위 문서 저장 (kebab-case) |
| 5-2 | **글로벌 _index.md 갱신**: `docs/spec/_index.md` 목록 테이블에 신규 행 추가 (디렉토리 링크, 제목, 생성일, 설명) |
| 5-3 | **Linear Document 생성 (선택)**: 승인 시 Linear MCP로 Document 생성 |

> G5 출력: 저장 완료 확인 + Linear Document 생성 여부 → `AskUserQuestion`으로 한 번에 확인

> spec 문서 템플릿 SSOT: [templates/spec-template.md](templates/spec-template.md)

## Output

| 항목 | 내용 |
|------|------|
| spec 디렉토리 | `docs/spec/{spec-name}/` — `_index.md` + N개 하위 문서 |
| spec 글로벌 인덱스 | `docs/spec/_index.md` 자동 갱신 |
| Linear Document | (선택) `[Spec] {제목}` — spec Git 링크 + 하위 문서별 앵커 포함 |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 코드 탐색 (G2) | `oh-my-claudecode:explore` | haiku |
| 심층 분석 (G2) | `oh-my-claudecode:scientist` | opus — 기술 스펙/외부 프로토콜 필요 시 |

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Linear Document 생성 | `create_document` | `[Spec] {제목}` Document 생성. 본문에 Git spec 디렉토리 링크 + 하위 문서별 앵커 |
| 관련 Issue 조회 | `list_issues` | Related Issues 섹션 자동 구성 |

---

## Linear Document 연동 패턴

| 항목 | 내용 |
|------|------|
| Document 제목 | `[Spec] {spec 문서 제목}` |
| 디렉토리 링크 | `docs/spec/{spec-name}/` (진입점) |
| 하위 문서 링크 | `docs/spec/{spec-name}/{doc}.md` (개별 문서) |
| 섹션 앵커 링크 | `docs/spec/{spec-name}/{doc}.md#section` — GitHub 앵커 형식 |
| 상세 결정 기록 | Linear Document 본문에 직접 작성 (spec 섹션을 참조하면서 상세 결정) |

> spec 문서에 Linear Document URL을 기록하지 않는다 (3영역 SSOT — Linear가 상태 영역).

---

## `/조사` 스킬과의 관계

| 스킬 | 범위 | 산출물 | 귀속 |
|------|------|--------|------|
| `/조사` | Issue 단위 조사 | 보고서 (RPT-*) | 특정 Issue |
| `/스펙` | 기능 단위 명세 | spec 디렉토리 (문서들) | cross-cutting (여러 Issue) |

두 스킬은 독립적. `/스펙`이 `/조사` 결과를 참조할 수 있음 (링크).
