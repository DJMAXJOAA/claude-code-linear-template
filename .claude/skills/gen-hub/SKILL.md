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
| spec 레퍼런스 | 관련 spec 문서 경로 + 섹션 앵커 (선택). 예: `docs/spec/combat-system.md#functional-requirements` |

## Process

| 단계 | 행위 |
|------|------|
| 0 (G0) | **Linear 컨텍스트 조회**: `list_issue_labels` + `list_projects`를 **병렬** 호출하여 기존 Label/Project 목록 획득. 배치 모드에서 호출 시 캐싱 데이터가 전달되면 이 단계 생략 |
| 1 (G1) | **사용자 입력 수집**: `AskUserQuestion`으로 제목, 설명, type 수집. 태그는 G0에서 조회한 기존 Label 목록 기반으로 AI 추천 후 승인. 마일스톤은 기존 Project 목록 기반 추천. spec 레퍼런스는 사용자 직접 지정 또는 AI가 `docs/spec/` 탐색 후 추천 |
| 2 (G2) | **type별 description 구성 + 사용자 승인**: 아래 §type별 description 템플릿에 따라 Linear Issue description 마크다운 조립 → `AskUserQuestion`으로 내용 확인 |
| 3 (G3) | **Linear Issue 생성**: Linear MCP로 Issue 생성 — title, description, labels(type + 태그), project(마일스톤), state: Backlog |
| 4 (G3) | **Linear Issue ID 획득**: 응답에서 `PRJ-N` 형식의 ID + URL 추출 |
| 5 (G3) | **Git 폴더 생성**: `docs/issue/{LINEAR-ID}/` 디렉토리 생성 |
| 6 (G3) | **_index.md 생성**: 아래 §_index.md 템플릿으로 파일 생성. Linear API 응답의 URL을 직접 사용 (수동 URL 조합 금지). spec 레퍼런스가 있으면 Documents 테이블에 Spec 행 추가 |
| 7 (G3) | **Linear description에 Git 경로 삽입**: description의 `## Git Documents` 섹션에 `docs/issue/{LINEAR-ID}/_index.md` 경로 기록. spec 레퍼런스 존재 시 spec 경로도 삽입 |

## Output

| 항목 | 내용 |
|------|------|
| Linear Issue | Backlog 상태의 새 Issue (type Label 부착) |
| Git 파일 | `docs/issue/{LINEAR-ID}/_index.md` |

---

> type별 description 템플릿: [templates/issue-descriptions.md](templates/issue-descriptions.md)

---

> _index.md 템플릿 (SSOT): [templates/index-templates.md](templates/index-templates.md)

---

## OMC 에이전트 연동

> gen-hub 자체는 에이전트 연동 없음.

> OMC 비활성 시 pipeline.md §9 참조.

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Label 목록 조회 | `list_issue_labels` | 기존 Label 목록 획득 → 태그 추천 기반 |
| Project 목록 조회 | `list_projects` | 활성 Project 목록 획득 → 마일스톤 추천 기반 |
| Team 확인 | `list_teams` | 팀 ID 확인 (필요 시) |
| Issue 생성 | `save_issue` (id 미지정) | title, description, labels, project, state, blockedBy, blocks, relatedTo, parentId 지정 |
| description 갱신 | `save_issue` (id 지정) | Git Documents 경로 삽입 |

> Label/Project 조회는 G0 단계에서 **병렬** 호출. 배치 모드에서 캐싱 데이터가 전달되면 생략.
