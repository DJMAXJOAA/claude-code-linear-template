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
| `type` | `index` / `plan` / `checklist` / `report` / `adr` / `shared` / `spec` / `spec-reference` | O | 문서 유형 |
| `issue_type` | `feature` / `bug` / `improvement` | △ | Issue 유형. `_index.md`에만 필수 |
| `created` | ISO 날짜 (예: `2026-03-17`) | O | 작성일 |

### 1-2. 문서 유형별 속성

| 문서 유형 | 속성 | 비고 |
|----------|------|------|
| `_index.md` (Issue 인덱스) | `linear_id`, `title`, `type`, `issue_type`, `created` | `type: index`, `issue_type: feature/bug/improvement` |
| `plan.md` (설계 SSOT) | `linear_id`, `title`, `type: plan`, `created` | title = "Plan: {Issue 제목}" |
| `cl.md` (태스크/검증 SSOT) | `linear_id`, `title`, `type: checklist`, `created` | title = "CL: {Issue 제목}" |
| ADR (`docs/adr/`) | `title`, `type: adr`, `created` | linear_id 없음 (cross-cutting) |
| Shared (`docs/shared/`) | `title`, `type: shared`, `created` | linear_id 없음 (cross-cutting) |
| Spec `_index.md` (`docs/spec/{name}/`) | `title`, `type: spec`, `created`, `updated` | linear_id 없음 (cross-cutting). 디렉토리 허브 (Overview + 하위 문서 목록) |
| Spec 하위 문서 (`docs/spec/{name}/`) | `title`, `type: spec`, `parent-spec: {spec-name}`, `created`, `updated` | `parent-spec`으로 소속 명시 |
| Spec Reference (`docs/spec/{name}/references/`) | `title`, `type: spec-reference`, `parent-spec: {spec-name}`, `created` | 조사 보고서. 선택적. `updated` 없음 (불변) |

---

## §2 _index.md 템플릿

> _index.md 템플릿 SSOT: [gen-hub templates/index-templates.md](../skills/gen-hub/templates/index-templates.md)

### 2-1. 핵심 규칙 (요약)

| 항목 | 규칙 |
|------|------|
| 생성 시점 | `/등록` 시 생성 (gen-hub). bug 제외 — bug는 Git 문서 미생성 |
| Linear Issue 링크 | gen-hub이 Linear API 응답 URL 직접 삽입. 수동 URL 조합 금지 |
| 구현 결과 섹션 | feature-close 시 lazy-creation |

> 전체 템플릿 규칙 + type별 변형: [gen-hub templates/index-templates.md](../skills/gen-hub/templates/index-templates.md) 참조

---

## §3 Lazy-creation 트리거

| 파일 | 트리거 | 조건 |
|------|--------|------|
| `_index.md` | `/등록` | 생성 (bug 제외) |
| `plan.md` | Planning 단계 진입 | gen-plan 스킬 호출 시 |
| `cl.md` | Planning 단계 진입 | gen-plan 스킬 호출 시 (plan.md와 동시) |
| `docs/spec/{name}/` | `/스펙` | 디렉토리 + `_index.md` + N개 하위 문서 생성 |

### Lazy-creation 행동 치환표

| 상황 | 조건 | 행동 |
|------|------|------|
| Decisions 기록 필요 | `_index.md` 존재 | `_index.md > ## Decisions` 섹션에 기록 |
| Notes 기록 필요 | `_index.md` 존재 | `_index.md > ## Notes` 섹션에 기록 (하위 ### 섹션 자동 생성) |
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
| Spec `_index.md` | `> ← [Spec Index](../_index.md)` — 글로벌 spec 인덱스 |
| Spec 하위 문서 | `> ← [_index.md](./_index.md)` — 소속 spec 인덱스 |
| Spec Reference 보고서 | `> ← [_index.md](../_index.md)` — 소속 spec 인덱스 (references/ 하위이므로 `../`) |

> 테이블 내 `\|`는 마크다운 이스케이프. 실제 파일에는 `|`로 기록.

---

## §5 문서 네이밍

### 5-1. docs/issue/{LINEAR-ID}/ 하위 파일명

| 파일 | 이름 규칙 | 예시 |
|------|----------|------|
| Issue 인덱스 | `_index.md` (고정) | `docs/issue/PRJ-47/_index.md` |
| Plan | `plan.md` (고정) | `docs/issue/PRJ-47/plan.md` |
| Checklist | `cl.md` (고정) | `docs/issue/PRJ-47/cl.md` |

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

### 5-4. docs/spec/{spec-name}/ 네이밍

| 파일 | 이름 규칙 | 예시 |
|------|----------|------|
| Spec 인덱스 | `_index.md` (고정) | `docs/spec/combat-system/_index.md` |
| Spec 하위 문서 | `{topic}.md` (kebab-case, 도메인 단위 자유 분할) | `docs/spec/combat-system/turn-system.md` |
| Spec Reference 보고서 | `references/{topic}.md` (kebab-case) | `docs/spec/combat-system/references/protocol-analysis.md` |

### 5-5. 폴더명 규칙

| 경로 | 규칙 | 비고 |
|------|------|------|
| `docs/issue/{LINEAR-ID}/` | Linear ID 그대로 사용 (대소문자 유지) | `docs/issue/PRJ-47/`, `docs/issue/PRJ-123/` |
| `docs/adr/` | 고정 | 변경 불가 |
| `docs/shared/` | 고정 | 변경 불가 |
| `docs/spec/` | 고정 | 변경 불가 |
| `docs/spec/{spec-name}/` | kebab-case | 2depth 제한. 예: `docs/spec/combat-system/` |
| `docs/spec/{spec-name}/references/` | 고정 (선택적) | 보고서 존재 시에만 생성. 미존재 시 디렉토리 자체 없음 |
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
| Spec = 기능 명세 원천 | 기능 요구사항, 기술 명세는 spec 문서가 SSOT. plan.md는 "How" 설계, spec은 "What/Why" 명세 |

---

## §7 문서 스타일

| 항목 | 지침 |
|------|------|
| 작성 스타일 | 테이블, 불릿 위주. 서술형 최소화 |
| 설명 필요 시 | 표의 "설명" 컬럼 활용 |
| 실행 스크립트 금지 | bash, python, JSON 스키마 등 코드 블록 포함 금지 (청사진 원칙) |
| 예외 | frontmatter/템플릿 예시, plan.md의 인터페이스 스케치(의사코드 수준), Mermaid 다이어그램(§7-2 참조)은 코드 블록 허용 |

### 7-2. Mermaid 다이어그램 가이드라인

| 규칙 | 내용 |
|------|------|
| spec 허용 유형 | flowchart, sequenceDiagram, stateDiagram-v2 |
| plan.md 허용 유형 | flowchart, sequenceDiagram, stateDiagram-v2, erDiagram |
| 금지 유형 (전체) | gantt, pie, mindmap, classDiagram |
| 크기 제한 | 노드 20개 이하, 엣지 30개 이하. 초과 시 분할 |
| 사용 위치 | spec 하위 문서 (What 수준), plan.md Approach 섹션 (How 수준). _index.md/cl.md 금지 |
| erDiagram 제한 사유 | ERD는 데이터 모델 설계(How 영역)이므로 spec(What/Why)에서는 사용 금지 |

---

## §8 보고서 참조 규칙

| 규칙 | 내용 |
|------|------|
| 보고서 불변 원칙 | 완료된 보고서는 수정 금지 — 새 보고서로 대체 |

> 보고서 생성 규칙 상세: [investigation SKILL.md](../skills/investigation/SKILL.md) 참조

---

## §9 spec 갱신 규칙

| 규칙 | 내용 |
|------|------|
| 생명주기 | Living document — 갱신 가능하나 갱신 필수 아님 |
| 구조 | `docs/spec/{spec-name}/` 디렉토리. `_index.md`(허브) + N개 하위 문서 (도메인 단위 자유 분할) |
| 초기 생성 | `/스펙` 스킬이 5-게이트 파이프라인(조사 → 프리필 인터뷰 → 구조 확인 → 작성+저장)으로 생성 |
| references 디렉토리 | (선택) `docs/spec/{name}/references/` — G2 조사에서 보고서 생성 시에만. spec(SDD)과 역할 분리: spec = "What/Why" 명세, 보고서 = 조사 결과 레퍼런스 |
| references 불변 원칙 | 완료된 보고서는 수정 금지 — 새 보고서로 대체 (§8 준용) |
| 연동 갱신 | feature-close 시 링크된 spec의 Related Issues + Change Log 갱신 (경로/링크 없으면 무시, 필수 아님) |
| `updated` 갱신 | spec 문서 변경 시 frontmatter `updated` 날짜 반드시 갱신 |
| 글로벌 _index.md 자동 갱신 | spec 생성/갱신 시 `docs/spec/_index.md` 목록 테이블 자동 갱신 |

> spec 생성 규칙 상세: [spec SKILL.md](../skills/spec/SKILL.md) 참조
