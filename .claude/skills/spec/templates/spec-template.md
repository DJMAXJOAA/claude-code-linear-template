# spec 문서 템플릿 (SSOT)

이 파일이 spec 문서 템플릿의 **SSOT**이다. docs-writing.md §1-2 및 spec SKILL.md는 이 파일을 참조한다.

## 템플릿 규칙

| 항목 | 규칙 |
|------|------|
| 생성 시점 | `/스펙` 커맨드 호출 시 항상 생성 |
| 디렉토리 위치 | `docs/spec/{spec-name}/` — kebab-case |
| 디렉토리 구성 | `_index.md`(필수) + N개 하위 문서 (도메인 단위 자유 분할) |
| 깊이 제한 | 2depth (`docs/spec/{name}/{doc}.md`) |
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

## 섹션별 작성 가이드

_index.md 및 하위 문서에서 사용할 수 있는 섹션. 필수 여부는 문서 단위로 판단.

| 섹션 | 필수 | 내용 | 상세도 |
|------|:----:|------|--------|
| Overview | O | What + Why + 대상 범위 | 1~3문장. _index.md에 필수 |
| Functional Requirements | O | 기능 요구사항 목록 | 테이블 형식. 수치/규칙 포함 |
| Constraints & Dependencies | O | 기술 제약 + 외부 의존성 + 기존 코드 제약 | 테이블 형식 |
| Technical Specifications | O | 프로토콜, 데이터 구조, 통신 패턴 | 의사코드 수준. 코드 인터페이스는 plan.md에 위임 |
| Out of Scope | O | 이 spec이 다루지 않는 것 | 경계 명확화. 불릿 목록 |
| Non-Functional Requirements | △ | 성능, 보안, 호환성 등 | 해당 시에만. 측정 가능한 기준 |
| UI/UX Specifications | △ | 화면 구성, 인터랙션 | 해당 시에만 |
| Related Issues | O | 관련 Linear Issue 목록 | 테이블. feature-close 시 자동 갱신 (경로/링크 없으면 무시) |
| Change Log | O | 변경 이력 | 날짜 + 요약 |

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

## Related Issues

| Linear ID | 제목 | 상태 |
|-----------|------|------|

## Change Log

| 날짜 | 변경 내용 |
|------|----------|
| {YYYY-MM-DD} | 초기 작성 |
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
```
