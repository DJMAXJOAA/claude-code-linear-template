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

## Process — G3a 포함 게이트 구조

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
| 2-3 | **References 보고서 마킹 (선택)**: 2-1/2-2에서 보고서 수준의 조사 결과가 생성되었으면, `references/` 저장 대상으로 자동 마킹. 보고서는 spec(SDD)과 역할 분리 — spec은 "What/Why" 명세, 보고서는 조사 결과 레퍼런스 |

> G2 출력: 조사 결과 통합 요약 (관련 코드, 기존 구조, 외부 스펙) + **References 보고서 포함 여부** → `AskUserQuestion`으로 유저 확인

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

### G3a. Spec 품질 검증

| 단계 | 행위 |
|------|------|
| 3a-1 | **자동 검증 실행**: G3 확정 요구사항에 대해 5개 검증 항목 자동 평가 |
| 3a-2 | **결과 제시**: 검증 결과를 PASS/WARN/FAIL로 제시 |
| 3a-3 | **실패 시 사용자 선택**: `AskUserQuestion`으로 (a) 자동 수정 적용 (AI 권장) (b) 수동 수정 (c) 무시하고 진행 (사유 기록 필수 — spec `_index.md` Notes에 `G3a override: {사유}` 자동 기입) |

G3a 검증 항목:

| # | 검증 항목 | 기준 | FAIL 조건 |
|---|----------|------|-----------|
| 1 | 완전성(Completeness) | 모든 필수 섹션(FR, Constraints, Tech Spec, Out of Scope) 존재 | 필수 섹션 누락 |
| 2 | 일관성(Consistency) | FR 간 모순 없음, Constraints와 FR 충돌 없음 | 상호 모순 감지 |
| 3 | 구현누출방지(No Implementation Leak) | FR이 How가 아닌 What만 기술 | 특정 라이브러리/함수명/구현 패턴 언급 |
| 4 | 검증가능성(Verifiability) | 각 FR이 테스트 가능한 기준 포함. **#3에서 FAIL된 FR은 대상 제외** | "적절한", "빠른" 등 모호 표현 |
| 5 | Constraints 분리 | 기술 제약이 FR에 혼입되지 않음 | FR 내 제약조건 기술 |

> 검증 순서: #1→#2→#3→#4→#5. #3에서 구현 누출로 FAIL된 FR은 #4(검증가능성)에서 중복 경고하지 않는다.

> G3a 출력: 검증 결과 (5항목 PASS/WARN/FAIL) + FAIL 항목 수정 제안 → `AskUserQuestion`으로 사용자 선택

### G4. 구조 확인

| 단계 | 행위 |
|------|------|
| 4-1 | **문서 분할 구조 제안**: G3 확정 요구사항을 기반으로 디렉토리 구조 제안 (`_index.md` + 하위 문서 N개, 도메인 단위 자유 분할). G2에서 보고서가 생성되었으면 `references/` 포함 여부도 함께 제시 |

> G4 출력: 디렉토리 구조만 제시 (초안 없음) → `AskUserQuestion`으로 간단 확인. 확인 즉시 G5로 진행

### G5. 작성 + 저장 + 후속

| 단계 | 행위 |
|------|------|
| 5-1 | **spec 문서 작성**: `templates/spec-template.md` 기반으로 `_index.md` + 하위 문서 작성. G2 보고서가 있으면 `references/` 하위에 보고서 파일도 작성. Change Log는 확장된 4-컬럼 형식(날짜/FR-ID/변경유형/변경내용)을 사용 (spec-template.md 참조) |
| 5-2 | **spec 디렉토리 저장**: `docs/spec/{spec-name}/` 디렉토리 + 전체 문서 저장 (kebab-case) |
| 5-3 | **글로벌 _index.md 갱신**: `docs/spec/_index.md` 목록 테이블에 신규 행 추가 (디렉토리 링크, 제목, 생성일, 설명) |
| 5-4 | **Linear Document 생성 (선택)**: 승인 시 Linear MCP로 Document 생성 |

> G5 출력: 저장 완료 확인 + Linear Document 생성 여부 → `AskUserQuestion`으로 한 번에 확인

> spec 문서 템플릿 SSOT: [templates/spec-template.md](templates/spec-template.md)

## Output

| 항목 | 내용 |
|------|------|
| spec 디렉토리 | `docs/spec/{spec-name}/` — `_index.md` + N개 하위 문서 |
| references 디렉토리 | (선택) `docs/spec/{spec-name}/references/` — 조사 보고서. G2에서 보고서 생성 시에만 |
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
