# spec — 기능 명세 생성 및 관리

`/스펙` 커맨드에서 호출되어, 기능 단위의 spec 문서를 생성한다. 조사 → 요구사항 인터뷰 → spec 문서 출력 → _index.md 자동 갱신 → Linear Document 생성(선택).

## Trigger

- `/스펙` 커맨드 호출 시
- 사용자가 "spec 작성", "명세 작성" 등을 요청할 때

## Input

| 항목 | 설명 |
|------|------|
| 기능 제목 | spec 대상 기능 이름 (사용자 입력) |
| 기능 설명 | What + Why (사용자 입력, 1~3문장) |
| 기존 spec | `docs/spec/` 내 기존 문서 확인 (중복 방지) |

## Process

| 단계 | 행위 | 게이트 |
|------|------|--------|
| 1 | **기능 범위 확인**: `$ARGUMENTS`에서 제목 파싱. 없으면 `AskUserQuestion`으로 기능 제목 + 설명 수집 | G1 |
| 2 | **기존 spec 확인**: `docs/spec/` 탐색하여 중복/관련 spec 확인. 관련 spec 존재 시 사용자에게 통합/분리 확인 | G1 |
| 3 | **코드베이스 조사**: `oh-my-claudecode:explore`로 관련 코드 탐색 + 기존 아키텍처 문서 참조 | G1 |
| 4 | **심층 조사 (선택)**: 외부 프로토콜/기술 스펙이 필요하면 `oh-my-claudecode:scientist` 위임 | G1 |
| 5 | **요구사항 인터뷰**: `AskUserQuestion`으로 항목별 순차 확인 — Functional Requirements → Non-Functional Requirements → Technical Specifications → UI/UX | G1 |
| 6 | **spec 문서 초안 제시**: `templates/spec-template.md` 기반 초안 작성 → `AskUserQuestion`으로 사용자 검토 | G2 |
| 7 | **spec 파일 저장**: `docs/spec/{spec-name}.md` 생성 (kebab-case) | G3 |
| 8 | **spec _index.md 자동 갱신**: `docs/spec/_index.md` 목록 테이블에 신규 행 추가 (파일명 링크, 제목, 수정일) | G3 |
| 9 | **Linear Document 생성 (선택)**: `AskUserQuestion`으로 확인 → 승인 시 Linear MCP로 Document 생성 | G3 |

> spec 문서 템플릿 SSOT: [templates/spec-template.md](templates/spec-template.md)

## Output

| 항목 | 내용 |
|------|------|
| spec 문서 | `docs/spec/{spec-name}.md` |
| spec 인덱스 | `docs/spec/_index.md` 자동 갱신 |
| Linear Document | (선택) `[Spec] {제목}` — spec Git 링크 + 섹션 앵커 포함 |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 코드 탐색 (3) | `oh-my-claudecode:explore` | haiku |
| 심층 분석 (4) | `oh-my-claudecode:scientist` | opus — 기술 스펙/외부 프로토콜 필요 시 |

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Linear Document 생성 | `create_document` | `[Spec] {제목}` Document 생성. 본문에 Git spec 링크 + 섹션 앵커 |
| 관련 Issue 조회 | `list_issues` | Related Issues 섹션 자동 구성 |

---

## Linear Document 연동 패턴

| 항목 | 내용 |
|------|------|
| Document 제목 | `[Spec] {spec 문서 제목}` |
| 전체 문서 링크 | `docs/spec/{spec-name}.md` |
| 섹션 앵커 링크 | `docs/spec/{spec-name}.md#technical-specifications` — GitHub 앵커 형식 |
| 상세 결정 기록 | Linear Document 본문에 직접 작성 (spec 섹션을 참조하면서 상세 결정) |

> spec 문서에 Linear Document URL을 기록하지 않는다 (3영역 SSOT — Linear가 상태 영역).

---

## `/조사` 스킬과의 관계

| 스킬 | 범위 | 산출물 | 귀속 |
|------|------|--------|------|
| `/조사` | Issue 단위 조사 | 보고서 (RPT-*) | 특정 Issue |
| `/스펙` | 기능 단위 명세 | spec 문서 | cross-cutting (여러 Issue) |

두 스킬은 독립적. `/스펙`이 `/조사` 결과를 참조할 수 있음 (링크).
