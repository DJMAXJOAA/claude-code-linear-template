---
name: spec
description: "기능 명세(SDD Spec) 생성 및 관리. 조사→기능 요구사항 확정→기술 설계→문서 저장→인덱스 갱신 파이프라인."
---

# spec — 기능 명세 생성 및 관리

`/스펙` 커맨드에서 호출되어, 고정된 파이프라인을 통해 유저 입력을 구조화된 spec 문서로 변환한다. 조사 → 기능 요구사항 확정 → 기술 설계 + 구현 로드맵 프리필 → 문서 저장 → 글로벌 인덱스 갱신 → Linear Document 생성(선택).

## Trigger

- `/스펙` 커맨드 호출 시
- 사용자가 "spec 작성", "명세 작성" 등을 요청할 때

## Input

| 항목 | 설명 |
|------|------|
| 기능 제목 | spec 대상 기능 이름 (사용자 입력) |
| 기능 설명 | What + Why (사용자 입력, 1~3문장) |
| 기존 spec | `docs/spec/` 내 기존 디렉토리 확인 (중복 방지 + 재호출 감지) |

## Process — 5+1 게이트 구조

모든 게이트에서 AI가 파악한 내용을 출력하고 유저 확인을 받은 후 다음으로 진행한다.

### G1. 범위 확정

| 단계 | 행위 |
|------|------|
| 1-1 | **기능 범위 확인**: `$ARGUMENTS`에서 제목 파싱. 없으면 `AskUserQuestion`으로 기능 제목 + 설명 수집 |
| 1-2 | **기존 spec 확인**: `docs/spec/` 탐색하여 중복/관련 spec 디렉토리 확인 |
| 1-3 | **재호출/재생성 감지**: 동일 이름 또는 관련 spec 디렉토리 존재 시 아래 3가지 경로 중 `AskUserQuestion`으로 유저 선택 |

G1 재호출/재생성 경로:

| 경로 | 조건 | 행동 |
|------|------|------|
| **덮어쓰기** | 동일 이름 디렉토리 존재 | 기존 파일 목록 diff 제시 → 유저 확인 후 덮어쓰기 |
| **새 디렉토리로 재생성** | 기존 spec 내용을 기반으로 새 구조로 재작성 | 새 kebab-case 디렉토리명 결정 → 기존 spec과 독립된 문서 생성. 기존 spec은 유지/삭제 유저 선택 |
| **마이그레이션** | 기존 spec이 도메인별 분할(레거시) | 새 고정 구조로 내용 재분류. 기존 _index.md의 Change Log 보존 |

> G1 출력: 기능 제목, 설명, 기존 spec 상태(신규/재호출/재생성/관련 존재), 선택된 경로 → `AskUserQuestion`으로 유저 확인

### G2. 조사 확인

| 단계 | 행위 |
|------|------|
| 2-1 | **경량/전체 경로 판별**: G1에서 "재생성/마이그레이션" 경로인 경우 기존 spec 내용 + 코드 현황 delta만 확인 (경량 경로). 신규인 경우 전체 조사 (전체 경로) |
| 2-2 | **코드베이스 조사**: `oh-my-claudecode:explore`로 관련 코드 탐색 + 기존 아키텍처 문서 참조. 경량 경로에서는 기존 spec 대비 코드 변경 사항에 집중 |
| 2-3 | **심층 조사 (선택)**: 외부 프로토콜/기술 스펙이 필요하면 `oh-my-claudecode:scientist` 위임 |
| 2-4 | **References 보고서 마킹 (선택)**: 2-2/2-3에서 보고서 수준의 조사 결과가 생성되었으면, `references/` 저장 대상으로 자동 마킹 |

> G2 출력: 조사 결과 통합 요약 (관련 코드, 기존 구조, 외부 스펙) + References 보고서 포함 여부 → `AskUserQuestion`으로 유저 확인

### G3. 기능 요구사항 확정

| 단계 | 행위 |
|------|------|
| 3-1 | **프리필 인터뷰**: G2 조사 결과를 기반으로 인터뷰 항목을 프리필한 상태로 제시. 유저는 **리뷰/수정/보완 모드**로 확인 |

인터뷰 항목 (순차 확인) — `requirements.md` 범위:

| 순서 | 항목 | 필수 | 비고 |
|------|------|:----:|------|
| 1 | Functional Requirements | O | EARS 형식. G5에서 최종 적용 |
| 2 | Constraints & Dependencies | O | 기술 제약 + 외부 의존성 + 기존 코드 제약 |
| 3 | Non-Functional Requirements | △ | 해당 시에만 |
| 4 | UI/UX Specifications | △ | 해당 시에만 |

> G3 출력: 프리필된 요구사항 전체 → `AskUserQuestion`으로 유저 확인/수정

### G3a. Spec 품질 검증

| 단계 | 행위 |
|------|------|
| 3a-1 | **자동 검증 실행**: G3 확정 요구사항에 대해 5개 검증 항목 자동 평가 |
| 3a-2 | **결과 제시**: 검증 결과를 PASS/WARN/FAIL로 제시 |
| 3a-3 | **전체 PASS 시**: 검증 결과를 출력하고 G4로 자동 진행. `AskUserQuestion` 불필요 |
| 3a-4 | **FAIL 존재 시 사용자 선택**: `AskUserQuestion`으로 (a) 자동 수정 적용 (AI 권장) (b) 수동 수정 (c) 무시하고 진행 (사유 기록 필수 — `_index.md` Notes에 `G3a override: {사유}` 자동 기입) |

G3a 검증 항목 — `requirements.md` 범위에만 적용:

| # | 검증 항목 | 기준 | FAIL 조건 |
|---|----------|------|-----------|
| 1 | 완전성(Completeness) | 필수 섹션(FR, Constraints) 존재 | 필수 섹션 누락 |
| 2 | 일관성(Consistency) | FR 간 모순 없음, Constraints와 FR 충돌 없음 | 상호 모순 감지 |
| 3 | 구현누출방지(No Implementation Leak) | FR이 How가 아닌 What만 기술 | 특정 라이브러리/함수명/구현 패턴 언급 |
| 4 | 검증가능성(Verifiability) | 각 FR이 테스트 가능한 기준 포함. **#3에서 FAIL된 FR은 대상 제외** | "적절한", "빠른" 등 모호 표현 |
| 5 | Constraints 분리 | 기술 제약이 FR에 혼입되지 않음 | FR 내 제약조건 기술 |

> 검증 순서: #1→#2→#3→#4→#5. #3에서 구현 누출로 FAIL된 FR은 #4(검증가능성)에서 중복 경고하지 않는다.

> G3a 출력: 검증 결과 (5항목 PASS/WARN/FAIL) + FAIL 항목 수정 제안 → `AskUserQuestion`으로 사용자 선택

### G4. 기술 설계 + 구현 로드맵 확정

| 단계 | 행위 |
|------|------|
| 4-1 | **technical.md 프리필**: G3 확정 요구사항 기반으로 계약 수준 기술 설계 초안 작성. [spec-technical-template.md](templates/spec-technical-template.md) 참조 |
| 4-2 | **roadmap.md 프리필 (해당 시)**: G3 요구사항 규모/복잡도 기반으로 AI가 2+ Issue 분할 여부 판별 → `AskUserQuestion`으로 확인. 분할 불필요 시 스킵. [spec-roadmap-template.md](templates/spec-roadmap-template.md) 참조 |
| 4-3 | **동시 리뷰**: technical.md + roadmap.md(해당 시) 초안을 한 번에 제시 |

> G4 출력: technical.md 초안 + roadmap.md 초안(해당 시) → `AskUserQuestion`으로 유저 한 번에 리뷰/수정

### G5. 작성 + 저장 + 후속

| 단계 | 행위 |
|------|------|
| 5-1 | **spec 문서 작성**: 각 템플릿 기반으로 고정 구조 문서 작성. EARS 최종 적용. G2 보고서가 있으면 `references/` 하위에 보고서 파일도 작성 |
| 5-2 | **spec 디렉토리 저장**: `docs/spec/{spec-name}/` 디렉토리 + 전체 문서 저장 (kebab-case) |
| 5-3 | **글로벌 _index.md 갱신**: `docs/spec/_index.md` 목록 테이블에 신규 행 추가 |
| 5-4 | **Linear Document 생성 (선택)**: 승인 시 Linear MCP로 Document 생성 |

생성 파일 목록:

| 파일 | 필수 | 템플릿 |
|------|:----:|--------|
| `_index.md` | O | [spec-index-template.md](templates/spec-index-template.md) |
| `requirements.md` | O | [spec-requirements-template.md](templates/spec-requirements-template.md) |
| `technical.md` | O | [spec-technical-template.md](templates/spec-technical-template.md) |
| `roadmap.md` | △ | [spec-roadmap-template.md](templates/spec-roadmap-template.md) |
| `references/*.md` | △ | [spec-reference-template.md](templates/spec-reference-template.md) |

> G5 출력: 저장 완료 확인 + Linear Document 생성 여부 → `AskUserQuestion`으로 한 번에 확인

## Output

| 항목 | 내용 |
|------|------|
| spec 디렉토리 | `docs/spec/{spec-name}/` — `_index.md` + `requirements.md` + `technical.md` + `roadmap.md`(선택) |
| references 디렉토리 | (선택) `docs/spec/{spec-name}/references/` — 조사 보고서. G2에서 보고서 생성 시에만 |
| spec 글로벌 인덱스 | `docs/spec/_index.md` 자동 갱신 |
| Linear Document | (선택) `[Spec] {제목}` — spec Git 링크 + 문서별 앵커 포함 |

---

## OMC 에이전트 연동

| 단계 | 에이전트 | 모델 |
|------|---------|------|
| 코드 탐색 (G2) | `oh-my-claudecode:explore` | haiku |
| 심층 분석 (G2) | `oh-my-claudecode:scientist` | opus — 기술 스펙/외부 프로토콜 필요 시 |

> OMC 비활성 시 기본 모델로 직접 수행. 비활성 감지 시 사용자에게 알림.

---

## Linear MCP

| 행동 | 상세 |
|------|------|
| `[Spec] {제목}` Document 생성 | G5 완료 후 선택적. Git spec 링크 + 앵커 포함 |

---

## Linear Document 연동 패턴

| 항목 | 내용 |
|------|------|
| Document 제목 | `[Spec] {spec 문서 제목}` |
| 디렉토리 링크 | `docs/spec/{spec-name}/` (진입점) |
| 문서별 링크 | `docs/spec/{spec-name}/{doc}.md` (개별 문서) |
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

---

## 마이그레이션 규칙

기존 spec(도메인별 분할)을 재호출할 경우:

| 규칙 | 내용 |
|------|------|
| 구조 변환 | 기존 도메인별 하위 문서 → 고정 구조(requirements.md, technical.md)로 내용 재분류 |
| roadmap 스킵 | 기존 하위 문서에서 roadmap에 해당하는 내용이 없으면 roadmap.md 생성 스킵 |
| _index.md 유지 | 기존 _index.md의 Change Log는 보존 |
| references 유지 | 기존 references/ 디렉토리가 있으면 그대로 유지 |
