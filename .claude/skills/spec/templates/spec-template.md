# spec 문서 템플릿 (SSOT)

이 파일이 spec 문서 템플릿의 **SSOT**이다. docs-writing.md §1-2 및 spec SKILL.md는 이 파일을 참조한다.

## 템플릿 규칙

| 항목 | 규칙 |
|------|------|
| 생성 시점 | `/스펙` 커맨드 호출 시 항상 생성 |
| 디렉토리 위치 | `docs/spec/{spec-name}/` — kebab-case |
| 디렉토리 구성 | `_index.md`(필수) + N개 하위 문서 (도메인 단위 자유 분할) + `references/`(선택) |
| references 디렉토리 | (선택) `docs/spec/{name}/references/` — G2 조사에서 보고서 생성 시에만 생성. 보고서 없으면 디렉토리 자체 미생성 |
| 깊이 제한 | 2depth (`docs/spec/{name}/{doc}.md`), references는 예외 (`docs/spec/{name}/references/{report}.md`) |
| 생명주기 | Living document — 갱신 가능하나 갱신 필수 아님 |
| 갱신 주체 | `/스펙`(초기 생성/재호출), feature-close(Issue 완료 시 연동 갱신 — 경로/링크 없으면 무시) |
| 글로벌 _index.md 갱신 | spec 생성/갱신 시 `docs/spec/_index.md` 자동 갱신 |
| 앵커 참조 | 하위 문서별 `##` 헤딩이 Linear Document에서 앵커로 링크 가능 (GitHub 호환) |

## 문서 유형

### 1. spec `_index.md` — 디렉토리 허브

| 항목 | 규칙 |
|------|------|
| 역할 | Overview (standalone readable) + 하위 문서 목록 |
| frontmatter | `title`, `type: spec`, `created`, `updated` |
| Nav Link | `> ← [Spec Index](../_index.md)` |

### 2. spec 하위 문서 — 도메인별 명세

| 항목 | 규칙 |
|------|------|
| 역할 | 도메인 단위 상세 명세 |
| frontmatter | `title`, `type: spec`, `parent-spec: {spec-name}`, `created`, `updated` |
| Nav Link | `> ← [_index.md](./_index.md)` |
| 본문 구성 | 자유 (고정 양식 없음). 아래 섹션 가이드 참조 |

### 3. Reference 보고서 — 조사 결과 레퍼런스 (선택)

| 항목 | 규칙 |
|------|------|
| 역할 | spec(SDD)이 참조하는 조사 결과 보고서. spec = "What/Why" 명세, 보고서 = 조사 결과 레퍼런스. 역할 혼합 금지 |
| 위치 | `docs/spec/{spec-name}/references/` |
| 생성 조건 | G2 조사에서 보고서 수준의 결과 생성 시에만. 선택적 |
| frontmatter | `title`, `type: spec-reference`, `parent-spec: {spec-name}`, `created` |
| Nav Link | `> ← [_index.md](../_index.md)` |
| 본문 구성 | 자유. 조사 방법, 결과, 결론 중심 |
| 불변 원칙 | 완료된 보고서는 수정 금지 — 새 보고서로 대체 (docs-writing.md §8 준용) |

## 섹션별 작성 가이드

_index.md 및 하위 문서에서 사용할 수 있는 섹션. 필수 여부는 문서 단위로 판단.

| 섹션 | 필수 | 내용 | 상세도 |
|------|:----:|------|--------|
| Overview | O | What + Why + 대상 범위 | 1~3문장. _index.md에 필수 |
| Functional Requirements | O | FR-ID 부여된 기능 요구사항 목록 | EARS 형식 테이블. FR-NNN 체계 (spec-local). 아래 FR-ID 체계 + EARS 출력 형식 참조 |
| Constraints & Dependencies | O | 기술 제약 + 외부 의존성 + 기존 코드 제약 | 테이블 형식 |
| Technical Specifications | O | 프로토콜, 데이터 구조, 통신 패턴 | 의사코드 수준. 코드 인터페이스는 plan.md에 위임 |
| Out of Scope | O | 이 spec이 다루지 않는 것 | 경계 명확화. 불릿 목록 |
| Non-Functional Requirements | △ | 성능, 보안, 호환성 등 | 해당 시에만. 측정 가능한 기준 |
| UI/UX Specifications | △ | 화면 구성, 인터랙션 | 해당 시에만 |
| Related Issues | O | 관련 Linear Issue 목록 | 테이블. feature-close 시 자동 갱신 (경로/링크 없으면 무시) |
| Change Log | O | 변경 이력 | 날짜 + FR-ID + 변경 유형(added/modified/removed) + 요약. FR 무관 변경 시 FR-ID = `--` |

## FR-ID 체계

| 항목 | 규칙 |
|------|------|
| 형식 | `FR-NNN` (spec-local. 각 spec 디렉토리 내에서 001부터 순차) |
| 소속 식별 | `parent-spec` frontmatter로 spec 귀속 판별 (docs-writing.md §1-2 기존 규칙) |
| 외부 참조 | 참조 사이트(plan.md, cl.md)에서 다른 spec의 FR을 참조할 경우: `{spec-name}:FR-NNN` |
| 번호 규칙 | 001부터 순차. 삭제된 번호 재사용 금지 |
| 권장 상한 | 30개/문서. 초과 시 하위 문서 분할 권고 (hard limit 아님) |

## EARS 출력 형식

G5(작성+저장) 단계에서 FR 테이블의 "요구사항" 컬럼에 적용. G3(인터뷰) 중에는 자연어 허용.

| 패턴 | 구문 | 예시 |
|------|------|------|
| Ubiquitous | The system shall {action} | The system shall 모든 에러를 로그에 기록한다 |
| Event-driven | When {trigger}, the system shall {action} | When 유저가 저장 버튼을 클릭하면, the system shall 데이터를 영속화한다 |
| State-driven | While {state}, the system shall {action} | While 오프라인 상태인 동안, the system shall 요청을 큐에 저장한다 |
| Unwanted | If {unwanted condition}, then the system shall {mitigation} | If 서버 연결이 30초 이상 무응답이면, then the system shall 재연결을 시도한다 |
| Optional | Where {feature is enabled}, the system shall {action} | Where 미니맵이 활성화되면, the system shall 플레이어 위치를 실시간 표시한다 |

> **언어 규칙**: EARS 키워드(When/If/While/Where/shall)는 영어 유지. 변수 부분({trigger}, {action} 등)은 프로젝트 언어로 작성.
>
> **패턴 선택 기준**: Event-driven(정상 트리거), State-driven(상태 중 동작), Ubiquitous(상시 제약), Unwanted(비정상/예외 방어), Optional(사용자 선택 기능)

> **역할 분리**: spec은 "What/Why" 명세. plan.md는 "How" 설계. 중복 기술 금지.

---

## 템플릿: spec `_index.md`

```markdown
---
title: {spec 제목}
type: spec
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

> ← [Spec Index](../_index.md)

## Overview

| 항목 | 내용 |
|------|------|
| What | {한 줄 설명} |
| Why | {필요성} |
| Scope | {대상 범위} |

## Out of Scope

- {이 spec이 다루지 않는 것}

## Documents

| 문서 | 제목 | 설명 |
|------|------|------|
| [{doc-name}.md](./{doc-name}.md) | {제목} | {한 줄 설명} |

## References

{G2 조사에서 보고서 생성 시에만 포함. 보고서 없으면 이 섹션 자체 생략}

| 보고서 | 제목 | 설명 |
|--------|------|------|
| [references/{report-name}.md](./references/{report-name}.md) | {제목} | {조사 대상 요약} |

## Related Issues

| Linear ID | 제목 | 상태 |
|-----------|------|------|

## Change Log

| 날짜 | FR-ID | 변경 유형 | 변경 내용 |
|------|-------|----------|----------|
| {YYYY-MM-DD} | -- | -- | 초기 작성 |
```

## 템플릿: spec 하위 문서

```markdown
---
title: {문서 제목}
type: spec
parent-spec: {spec-name}
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

> ← [_index.md](./_index.md)

{본문 — 자유 구성. 섹션별 작성 가이드 참조}

{Functional Requirements 섹션 포함 시 아래 형식 사용:}

## Functional Requirements

| FR-ID | 패턴 | 요구사항 | 비고 |
|-------|------|---------|------|
| FR-001 | Event-driven | When {trigger}, the system shall {action} | {비고} |
```

## 템플릿: Reference 보고서 (선택)

```markdown
---
title: {보고서 제목}
type: spec-reference
parent-spec: {spec-name}
created: {YYYY-MM-DD}
---

> ← [_index.md](../_index.md)

## 조사 배경

{조사 목적 + 대상}

## 조사 방법

{사용한 도구/접근법}

## 결과

{핵심 발견 사항}

## 결론

{spec에 반영할 시사점}
```
