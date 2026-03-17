# investigation — 조사 수행 및 보고서 생성

research type Issue의 조사를 수행한다. 조사 범위 확인 → 수행 → 보고서 작성 → _index.md 갱신 → 사용자 확인 → 완료 결과 반환.

## Trigger

- dev-pipeline에서 research type, Backlog → In Progress 진입 시
- `/조사` 커맨드에서 호출 시

## Input

| 항목 | 설명 |
|------|------|
| Linear ID | `PRJ-N` — 대상 Issue 식별자 |
| Linear Issue 정보 | description (Overview, Scope, Deliverables) |
| _index.md | `docs/research/{LINEAR-ID}/_index.md` — 기존 문서 확인 |

## Process

| 단계 | 행위 |
|------|------|
| 1 (G1) | **조사 범위 확인**: Linear Issue description의 Scope/Deliverables 읽기 |
| 2 (G1) | **코드베이스/외부 자료 조사**: `oh-my-claudecode:explore`로 코드 탐색 + 필요 시 외부 문서 참조. 심층 분석이 필요하면 `oh-my-claudecode:scientist`에 분석 위임 |
| 3 (G1) | **조사 보고서 작성**: `docs/research/{LINEAR-ID}/RPT-{LINEAR-ID}-{YYYYMMDD}.md` 생성 |
| 4 (G2) | **사용자에게 결과 요약 + 확인**: `AskUserQuestion`으로 검토 |
| 5 (G3) | **_index.md Documents 테이블 갱신**: 조사 보고서 행 추가 |
| 6 (G4) | **완료 결과를 반환**: 승인 시 완료 결과를 반환. dev-pipeline이 feature-close 결정 |

## Output

| 항목 | 내용 |
|------|------|
| 조사 보고서 | `docs/research/{LINEAR-ID}/RPT-{LINEAR-ID}-{YYYYMMDD}.md` |
| _index.md | Documents 테이블에 보고서 행 추가 |
| Linear | State 전이는 feature-close에서 처리 |

---

## 조사 보고서 구조

> 조사 보고서 템플릿: [templates/report-template.md](templates/report-template.md)

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 코드 탐색 | `oh-my-claudecode:explore` | haiku |
| 심층 분석 | `oh-my-claudecode:scientist` | opus — 조사 범위가 넓거나 기술적 판단이 필요할 때 호출. Process 2 단계에서 explore 결과를 전달하여 분석 수행 |

> OMC 비활성 시 pipeline.md §9 참조.

---

## 보고서 참조 규칙

| 규칙 | 내용 |
|------|------|
| 보고서 대상 | research 조사 보고서만 해당 (태스크별 L2 보고서는 `_index.md > ## Task Log`로 대체) |
| 보고서 경로 | `docs/research/{LINEAR-ID}/RPT-*.md` (research type 폴더 내) |
| 보고서 frontmatter | `linear_id`, `title`, `type: report`, `created` |
| 보고서 링킹 | 보고서 → _index.md 역참조 Nav Link 필수 |
| 보고서 불변 원칙 | 완료된 보고서는 수정 금지 — 새 보고서로 대체 |

---

## Linear MCP 호출 패턴

| 시점 | MCP 도구 | 용도 |
|------|---------|------|
| Issue 정보 조회 | `get_issue` | description (Scope, Deliverables) 읽기 (단일 Issue) |
| 상태 전이 | `save_issue` (id 지정) | State → In Progress (조사 시작 시) |
