---
paths:
  - "docs/**"
description: 문서 작성 규칙 — Frontmatter, 템플릿, Lazy-creation, 링킹, 네이밍, SSOT
---

# Documentation Writing Rules

## §1 Frontmatter 규칙

### 1-1. 공통 속성 (모든 문서)

| 속성 | 형식 | 필수 | 설명 |
|------|------|:----:|------|
| `linear_id` | 문자열 (예: `PRJ-47`) | O | Linear Issue ID. 해당 Issue와 무관한 문서(ADR, shared)는 제외 |
| `title` | 문자열 | O | 문서 제목 |
| `type` | `index` / `plan` / `checklist` / `report` / `adr` / `shared` | O | 문서 유형 |
| `issue_type` | `feature` / `bug` / `improvement` / `research` | △ | Issue 유형. `_index.md`에만 필수 |
| `created` | ISO 날짜 (예: `2026-03-17`) | O | 작성일 |

### 1-2. 문서 유형별 속성

| 문서 유형 | 속성 | 비고 |
|----------|------|------|
| `_index.md` (Issue 인덱스) | `linear_id`, `title`, `type`, `issue_type`, `created` | `type: index`, `issue_type: feature/bug/improvement/research` |
| `plan.md` (설계 SSOT) | `linear_id`, `title`, `type: plan`, `created` | title = "Plan: {Issue 제목}" |
| `cl.md` (태스크/검증 SSOT) | `linear_id`, `title`, `type: checklist`, `created` | title = "CL: {Issue 제목}" |
| `RPT-*.md` (보고서) | `linear_id`, `title`, `type: report`, `created` | research 조사 보고서만 해당 |
| ADR (`docs/adr/`) | `title`, `type: adr`, `created` | linear_id 없음 (cross-cutting) |
| Shared (`docs/shared/`) | `title`, `type: shared`, `created` | linear_id 없음 (cross-cutting) |

---

## §2 _index.md 템플릿

### 2-1. 표준 구조

```markdown
---
linear_id: PRJ-47
title: 이모티콘 핑 시스템
type: index
issue_type: feature
created: 2026-03-17
---

> [Linear Issue](https://linear.app/{workspace-slug}/issue/PRJ-47)

## Documents

| 문서 | 경로 | 상태 |
|------|------|------|
| Plan | [plan.md](plan.md) | ✅ |
| Checklist | [cl.md](cl.md) | ✅ |

## Decisions

{Pre-Plan Q/A Phase 1에서 확정된 설계 결정 사항}

## Notes

{피드백, Known Limitations, 기타 메모}

## Task Log

{태스크 완료 시 간략 로그}

## 구현 결과

{feature-close 시 lazy-creation — 실제 인터페이스, 설계 이탈, 미해결 이슈}
```

### 2-2. 템플릿 규칙

| 항목 | 규칙 |
|------|------|
| 생성 시점 | `/등록` 시 항상 생성 |
| Linear Issue 링크 | gen-hub 스킬이 Linear API 응답의 URL을 직접 삽입. 수동 URL 조합 금지 |
| Documents 테이블 | 존재하는 파일은 상대경로 링크 + ✅. 미생성 파일은 `—` + `미생성` |
| 구현 결과 섹션 | feature-close 시 lazy-creation. 최초 생성 시 빈 placeholder |
| 상태 컬럼 갱신 | 파일 생성/삭제 시 Documents 테이블 갱신 |
| Decisions 섹션 | Pre-Plan Q/A Phase 1에서 Decisions 항목 확정 시 기록. 구현 중 설계 결정 발생 시 추가 |
| Notes 섹션 | 피드백(limitation), triage log, Known Limitations 발생 시 기록 |
| Task Log 섹션 | implement 스킬에서 태스크 완료 시 간략 로그 기록 |

### 2-3. research type _index.md 변형

Documents 테이블에서 Plan/Checklist 행 생략. 조사 보고서 행만 표시:

| 문서 | 경로 | 상태 |
|------|------|------|
| 조사 보고서 | — | 미생성 |

---

## §3 Lazy-creation 트리거

| 파일 | 트리거 | 조건 |
|------|--------|------|
| `_index.md` | `/등록` | 항상 생성 |
| `plan.md` | Planning 단계 진입 | gen-plan 스킬 호출 시 |
| `cl.md` | Planning 단계 진입 | gen-plan 스킬 호출 시 (plan.md와 동시) |
| `RPT-*.md` (조사 보고서) | investigation 완료 | research type 전용 |

### Lazy-creation 행동 치환표

| 상황 | 조건 | 행동 |
|------|------|------|
| Decisions 기록 필요 | `_index.md` 존재 | `_index.md > ## Decisions` 섹션에 기록 |
| Notes 기록 필요 | `_index.md` 존재 | `_index.md > ## Notes` 섹션에 기록 (하위 ### 섹션 자동 생성) |
| Task Log 기록 필요 | `_index.md` 존재 | `_index.md > ## Task Log` 섹션에 기록 |
| _index.md Documents 갱신 | lazy 파일 신규 생성 | Documents 테이블에서 `—` → 상대경로 링크 + ✅ |

---

## §4 링킹 규칙

### 4-1. Git 내부 문서 간 링크

| 규칙 | 내용 |
|------|------|
| 경로 형식 | 상대경로 마크다운 링크 — `[표시](../상대경로)` |
| 절대경로 금지 | 프로젝트 루트 기준 상대경로만 사용 |
| 깨진 링크 금지 | 파일 이동/삭제 시 참조하는 모든 문서의 링크도 갱신 |
| 중복 기술 금지 | 동일 정보를 여러 문서에 복제하지 않고 링크로 연결 |

### 4-2. Linear Issue URL 참조 패턴

| 위치 | 형식 | 예시 |
|------|------|------|
| `_index.md` blockquote | `> [Linear Issue]({URL})` — gen-hub이 삽입한 URL 사용 | `> [Linear Issue](https://linear.app/ws/issue/PRJ-47)` |
| 문서 본문 내 참조 | `[{LINEAR-ID}]({URL})` — Linear API 응답 URL 사용 | `[PRJ-48](https://linear.app/ws/issue/PRJ-48)` |
| 다른 Issue 문서 참조 | Git 상대경로 우선 | `[PRJ-48 Plan](../PRJ-48/plan.md)` |

### 4-3. Nav Link blockquote

| 항목 | 규칙 |
|------|------|
| 위치 | frontmatter `---` 닫힌 직후, `#` 제목 또는 본문 직전 (빈 줄로 분리) |
| _index.md | `> [Linear Issue]({URL})` — Linear Issue 링크 |
| plan.md, cl.md | `> ← [_index.md](./_index.md) \| [Linear Issue]({URL})` — 상위 인덱스 + Linear |
| ADR | `> ← [ADR Index](../_index.md)` — ADR 인덱스 |
| RPT-*.md | `> ← [_index.md](./_index.md)` — 상위 인덱스 |

> 테이블 내 `\|`는 마크다운 이스케이프. 실제 파일에는 `|`로 기록.

---

## §5 문서 네이밍

### 5-1. docs/{type}/{LINEAR-ID}/ 하위 파일명

| 파일 | 이름 규칙 | 예시 |
|------|----------|------|
| Issue 인덱스 | `_index.md` (고정) | `docs/feature/PRJ-47/_index.md` |
| Plan | `plan.md` (고정) | `docs/feature/PRJ-47/plan.md` |
| Checklist | `cl.md` (고정) | `docs/feature/PRJ-47/cl.md` |
| 조사 보고서 | `RPT-{LINEAR-ID}-{YYYYMMDD}.md` | `docs/research/PRJ-47/RPT-PRJ-47-20260317.md` |

### 5-2. docs/adr/ 네이밍

| 파일 | 이름 규칙 | 예시 |
|------|----------|------|
| ADR 인덱스 | `_index.md` (고정) | `docs/adr/_index.md` |
| ADR 문서 | `ADR-{NNNN}.md` (4자리 순번) | `docs/adr/ADR-0001.md` |

### 5-3. docs/shared/ 네이밍

| 파일 | 이름 규칙 | 예시 |
|------|----------|------|
| 도메인 지식 | `domain-{topic}.md` (kebab-case) | `docs/shared/domain-networking.md` |
| 가이드 | `{topic}.md` (kebab-case) | `docs/shared/error-handling-patterns.md` |

### 5-4. 폴더명 규칙

| 경로 | 규칙 | 비고 |
|------|------|------|
| `docs/{type}/{LINEAR-ID}/` | type별 폴더 + Linear ID 그대로 사용 (대소문자 유지) | `docs/feature/PRJ-47/`, `docs/bug/PRJ-123/` |
| `docs/adr/` | 고정 | 변경 불가 |
| `docs/shared/` | 고정 | 변경 불가 |
| `docs/guides/` | 고정 | 변경 불가 |

---

## §6 SSOT 원칙

| 원칙 | 내용 |
|------|------|
| Plan = 설계 원천 | 다른 문서는 Plan을 참조하지 복제하지 않음 |
| CL = 태스크/검증 원천 | 태스크 목록, 완료 기준, 검증 조건은 CL 문서가 SSOT |
| Linear = 상태 원천 | 진행 상태, 라벨, 프로젝트, relation은 Linear가 SSOT. Git에 상태 복제 금지 |
| _index.md = 인덱스 원천 | Issue 폴더 내 문서 목록 + Linear ID 매핑 |
| 중복 기술 금지 | 동일 정보를 여러 문서에 복제하지 않고 링크로 연결 |

---

## §7 문서 스타일

| 항목 | 지침 |
|------|------|
| 작성 스타일 | 테이블, 불릿 위주. 서술형 최소화 |
| 설명 필요 시 | 표의 "설명" 컬럼 활용 |
| 실행 스크립트 금지 | bash, python, JSON 스키마 등 코드 블록 포함 금지 (청사진 원칙) |
| 예외 | frontmatter/템플릿 예시, plan.md의 인터페이스 스케치(의사코드 수준)는 코드 블록 허용 |

---

## §8 보고서 참조 규칙

| 규칙 | 내용 |
|------|------|
| 보고서 대상 | research 조사 보고서만 해당 (태스크별 L2 보고서는 `_index.md > ## Task Log`로 대체) |
| 보고서 경로 | `docs/research/{LINEAR-ID}/RPT-*.md` (research type 폴더 내) |
| 보고서 frontmatter | `linear_id`, `title`, `type: report`, `created` |
| 보고서 링킹 | 보고서 → _index.md 역참조 Nav Link 필수 |
| 보고서 불변 원칙 | 완료된 보고서는 수정 금지 — 새 보고서로 대체 |
