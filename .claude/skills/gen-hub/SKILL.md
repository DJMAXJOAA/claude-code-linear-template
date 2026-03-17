# gen-hub — _index.md + Linear Issue 생성

`/등록` 커맨드에서 호출되어, Linear Issue를 생성하고 Git에 `docs/{type}/{LINEAR-ID}/` 폴더 + `_index.md`를 생성한다.

## Trigger

- `/등록` 커맨드 호출 시
- 사용자가 직접 Issue 등록을 요청할 때

## Input

| 항목 | 설명 |
|------|------|
| 제목 | Issue 제목 |
| 설명 | What + Why (1~3문장) |
| type | `feature` / `bug` / `improvement` / `research` — 사용자 지정 또는 AI 추천 |
| 태그 | Linear Label로 등록할 태그 목록. AI가 컨텍스트 기반 추천 → 사용자 승인 |
| 마일스톤 | Linear Project에 매핑할 마일스톤 (선택) |
| Priority | High / Medium / Low (선택, 기본값: Medium) |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **사용자 입력 수집**: `AskUserQuestion`으로 제목, 설명, type 수집. 태그/마일스톤은 AI 추천 후 승인 |
| 2 (G2) | **type별 description 구성 + 사용자 승인**: 아래 §type별 description 템플릿에 따라 Linear Issue description 마크다운 조립 → `AskUserQuestion`으로 내용 확인 |
| 3 (G3) | **Linear Issue 생성**: Linear MCP로 Issue 생성 — title, description, labels(type + 태그), project(마일스톤), state: Backlog |
| 4 (G3) | **Linear Issue ID 획득**: 응답에서 `PRJ-N` 형식의 ID + URL 추출 |
| 5 (G3) | **Git 폴더 생성**: `docs/{type}/{LINEAR-ID}/` 디렉토리 생성 |
| 6 (G3) | **_index.md 생성**: 아래 §_index.md 템플릿으로 파일 생성. Linear API 응답의 URL을 직접 사용 (수동 URL 조합 금지) |
| 7 (G3) | **Linear description에 Git 경로 삽입**: description의 `## Git Documents` 섹션에 `docs/{type}/{LINEAR-ID}/_index.md` 경로 기록 |

## Output

| 항목 | 내용 |
|------|------|
| Linear Issue | Backlog 상태의 새 Issue (type Label 부착) |
| Git 파일 | `docs/{type}/{LINEAR-ID}/_index.md` |

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
| Team/Label 확인 | `list_teams` | label 이름 확인 (필요 시) |
| Issue 생성 | `save_issue` (id 미지정) | title, description, labels, project, state 지정 |
| description 갱신 | `save_issue` (id 지정) | Git Documents 경로 삽입 |
