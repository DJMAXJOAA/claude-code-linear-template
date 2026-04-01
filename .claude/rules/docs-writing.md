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
| `type` | `spec` / `technical` / `plan` / `report` / `adr` / `shared` / `spec-reference` | O | 문서 유형 |
| `issue_type` | `feature` / `bug` / `improvement` | △ | Issue 유형. `spec.md`에만 필수 |
| `created` | ISO 날짜 (예: `2026-03-17`) | O | 작성일 |

### 1-2. 문서 유형별 속성

| 문서 유형 | 속성 | 비고 |
|----------|------|------|
| `spec.md` (What/Why 원천) | `linear_id`, `title`, `type: spec`, `issue_type`, `created` | `issue_type: feature/bug/improvement`. deep-interview/deep-dive 산출 |
| `technical.md` (기술 설계 원천, 조건부) | `linear_id`, `title`, `type: technical`, `created` | gen-plan 호출 시 조건부 생성 |
| `plan.md` (실행 계획 원천) | `linear_id`, `title`, `type: plan`, `created` | title = "Plan: {Issue 제목}" |
| `prd.json` (실행 설정) | — | frontmatter 불필요 (JSON). ralph가 관리 |
| `progress.txt` (실행 기록) | — | frontmatter 불필요 (텍스트 로그). ralph가 관리 |
| ADR (`docs/adr/`) | `title`, `type: adr`, `created` | linear_id 없음 (cross-cutting) |
| Shared (`docs/shared/`) | `title`, `type: shared`, `created` | linear_id 없음 (cross-cutting) |
| Spec `_index.md` (`docs/spec/{name}/`) | `title`, `type: spec`, `created`, `updated` | linear_id 없음 (cross-cutting). 디렉토리 허브 (Overview + 고정 문서 목록) |
| Spec `requirements.md` (`docs/spec/{name}/`) | `title`, `type: spec`, `parent-spec: {spec-name}`, `created`, `updated` | 기능 요구사항 (FR, Constraints) |
| Spec `technical.md` (`docs/spec/{name}/`) | `title`, `type: spec`, `parent-spec: {spec-name}`, `created`, `updated` | 기술 설계 (계약 수준) |
| Spec `roadmap.md` (`docs/spec/{name}/`) △ | `title`, `type: spec`, `parent-spec: {spec-name}`, `created`, `updated` | 구현 로드맵 (2+ Issue 분할 시에만) |
| Spec Reference (`docs/spec/{name}/references/`) | `title`, `type: spec-reference`, `parent-spec: {spec-name}`, `created` | 조사 보고서. 선택적. `updated` 없음 (불변) |

---

## §2 Lazy-creation 트리거

| 파일 | 트리거 | 조건 |
|------|--------|------|
| `spec.md` | Pre-Plan 완료 시 | deep-interview/deep-dive 완료 시 |
| `technical.md` | Planning 단계 진입 | gen-plan 스킬 호출 시 (조건부 — 기술 설계 필요 시) |
| `plan.md` | Planning 단계 진입 | gen-plan 스킬 호출 시 |
| `docs/spec/{name}/` | `/스펙` | 디렉토리 + `_index.md` + `requirements.md` + `technical.md` + `roadmap.md`(선택) 생성 |

### Lazy-creation 행동 치환표

| 상황 | 조건 | 행동 |
|------|------|------|
| Documents 목록 갱신 | lazy 파일 신규 생성 | Linear description의 Documents 섹션 갱신 |

---

## §3 링킹 규칙

### 3-1. Git 내부 문서 간 링크

| 규칙 | 내용 |
|------|------|
| 경로 형식 | 상대경로 마크다운 링크 — `[표시](../상대경로)` |
| 절대경로 금지 | 프로젝트 루트 기준 상대경로만 사용 |
| 깨진 링크 금지 | 파일 이동/삭제 시 참조하는 모든 문서의 링크도 갱신 |
| 중복 기술 금지 | 동일 정보를 여러 문서에 복제하지 않고 링크로 연결 |

### 3-2. Linear Issue URL 참조 패턴

| 위치 | 형식 | 예시 |
|------|------|------|
| 문서 본문 내 참조 | `[{LINEAR-ID}]({URL})` — Linear API 응답 URL 사용 | `[PRJ-48](https://linear.app/ws/issue/PRJ-48)` |
| 다른 Issue 문서 참조 | Git 상대경로 우선 | `[PRJ-48 Plan](../PRJ-48/plan.md)` |

### 3-3. Nav Link blockquote

| 항목 | 규칙 |
|------|------|
| 위치 | frontmatter `---` 닫힌 직후, `#` 제목 또는 본문 직전 (빈 줄로 분리) |
| plan.md | `> [Linear Issue]({URL})` |
| spec.md | `> [Linear Issue]({URL})` |
| technical.md | `> [Linear Issue]({URL})` |
| ADR | `> ← [ADR Index](../_index.md)` — ADR 인덱스 |
| Spec `_index.md` | `> ← [Spec Index](../_index.md)` — 글로벌 spec 인덱스 |
| Spec `requirements.md` / `technical.md` / `roadmap.md` | `> ← [_index.md](./_index.md)` — 소속 spec 인덱스 |
| Spec Reference 보고서 | `> ← [_index.md](../_index.md)` — 소속 spec 인덱스 (references/ 하위이므로 `../`) |

> 테이블 내 `\|`는 마크다운 이스케이프. 실제 파일에는 `|`로 기록.

---

## §4 문서 네이밍

### 4-1. 파일명 규칙

| 위치 | 파일 | 이름 규칙 | 예시 |
|------|------|----------|------|
| `docs/issue/{LINEAR-ID}/` | Spec | `spec.md` (고정) | `PRJ-47/spec.md` |
| | 기술 설계 (조건부) | `technical.md` (고정) | `PRJ-47/technical.md` |
| | Plan | `plan.md` (고정) | `PRJ-47/plan.md` |
| | 실행 설정 | `prd.json` (고정) | `PRJ-47/prd.json` |
| | 실행 기록 | `progress.txt` (고정) | `PRJ-47/progress.txt` |
| `docs/adr/` | ADR 인덱스 | `_index.md` (고정) | `adr/_index.md` |
| | ADR 문서 | `ADR-{NNNN}.md` (4자리 순번) | `adr/ADR-0001.md` |
| `docs/shared/` | 도메인 지식 | `domain-{topic}.md` (kebab-case) | `shared/domain-networking.md` |
| | 가이드 | `{topic}.md` (kebab-case) | `shared/error-handling-patterns.md` |
| `docs/spec/{spec-name}/` | Spec 인덱스 | `_index.md` (고정) | `combat-system/_index.md` |
| | 기능 요구사항 | `requirements.md` (고정) | `combat-system/requirements.md` |
| | 기술 설계 | `technical.md` (고정) | `combat-system/technical.md` |
| | 구현 로드맵 (선택) | `roadmap.md` (고정) | `combat-system/roadmap.md` |
| | Spec Reference | `references/{topic}.md` (kebab-case) | `combat-system/references/protocol-analysis.md` |

### 4-2. 폴더명 규칙

| 경로 | 규칙 |
|------|------|
| `docs/issue/{LINEAR-ID}/` | Linear ID 그대로 (대소문자 유지) |
| `docs/adr/`, `docs/shared/`, `docs/spec/`, `docs/guides/` | 고정 (변경 불가) |
| `docs/spec/{spec-name}/` | kebab-case, 2depth 제한 |
| `docs/spec/{spec-name}/references/` | 고정 (선택적 — 보고서 존재 시에만 생성) |

---

## §5 SSOT 원칙

| 원칙 | 내용 |
|------|------|
| spec.md = What/Why 원천 | 요구사항, 스코프, 성공 기준의 SSOT. 다른 문서는 spec.md를 참조하지 복제하지 않음 |
| plan.md = 실행 계획 원천 | 태스크 목록(Tasks), 검증 조건(Verification), 실행 순서의 SSOT |
| technical.md = 기술 설계 원천 | 아키텍처, 인터페이스, 데이터 모델의 SSOT (조건부 생성) |
| progress.txt = 실행 기록 원천 | ralph가 관리하는 실행 기록의 SSOT |
| Linear = 상태 원천 | 진행 상태, 라벨, 프로젝트, relation은 Linear가 SSOT. Git에 상태 복제 금지 |
| 중복 기술 금지 | 동일 정보를 여러 문서에 복제하지 않고 링크로 연결 |
| Spec = 기능 명세 원천 | 기능 요구사항, 기술 명세는 spec 문서가 SSOT. plan.md는 "How" 설계, spec은 "What/Why" 명세 |
| 보고서 = 불변 | 완료된 보고서(RPT-*, spec-reference)는 수정 금지 — 새 보고서로 대체 |

---

## §6 문서 스타일

| 항목 | 지침 |
|------|------|
| 작성 스타일 | 테이블, 불릿 위주. 서술형 최소화 |
| 설명 필요 시 | 표의 "설명" 컬럼 활용 |
| 실행 스크립트 금지 | bash, python, JSON 스키마 등 코드 블록 포함 금지 (청사진 원칙) |
| 예외 | frontmatter/템플릿 예시, 의사코드, Mermaid는 허용. 상세: [gen-plan SKILL.md](../skills/gen-plan/SKILL.md), [spec-template.md](../skills/spec/templates/spec-template.md) |

---

## §7 spec 갱신 규칙

| 규칙 | 내용 |
|------|------|
| `updated` 갱신 | spec 문서 변경 시 frontmatter `updated` 날짜 반드시 갱신 |
| 글로벌 _index.md | spec 생성/갱신 시 `docs/spec/_index.md` 목록 테이블 자동 갱신 |

> 생명주기 + 생성 프로세스 + 연동 갱신 상세: [spec SKILL.md](../skills/spec/SKILL.md) 참조

---

## §8 Mermaid 다이어그램 가이드

| 다이어그램 | 허용 위치 |
|-----------|----------|
| `sequenceDiagram` | spec(이슈), spec(도메인), technical, plan |
| `flowchart` | spec(이슈), spec(도메인), technical, plan |
| `classDiagram` | technical만 |
| `erDiagram` | technical만 |
| `stateDiagram` | spec(이슈), spec(도메인), technical |

> spec(이슈)/spec(도메인): 역할명 사용. technical/plan: 클래스명 허용.
