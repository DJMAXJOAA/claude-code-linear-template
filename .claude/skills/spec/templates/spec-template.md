# spec 문서 템플릿 (SSOT)

이 파일이 spec 문서 템플릿의 **SSOT**이다. docs-writing.md §1-2 및 spec SKILL.md는 이 파일을 참조한다.

## 템플릿 규칙

| 항목 | 규칙 |
|------|------|
| 생성 시점 | `/스펙` 커맨드 호출 시 항상 생성 |
| 파일 위치 | `docs/spec/{spec-name}.md` — kebab-case |
| 생명주기 | Living document — 구현 진행 중 갱신 가능 |
| 갱신 주체 | `/스펙`(초기 생성), feature-close(Issue 완료 시 연동 갱신) |
| _index.md 갱신 | spec 생성/갱신 시 `docs/spec/_index.md` 자동 갱신 |
| 앵커 참조 | 모든 `##` 헤딩이 Linear Document에서 앵커로 링크 가능 (GitHub 호환) |

## 섹션별 작성 가이드

| 섹션 | 필수 | 내용 | 상세도 |
|------|:----:|------|--------|
| Overview | O | What + Why + 대상 범위 | 1~3문장 |
| Functional Requirements | O | 기능 요구사항 목록 | 테이블 형식. 수치/규칙 포함 |
| Non-Functional Requirements | △ | 성능, 보안, 호환성 등 | 해당 시에만. 측정 가능한 기준 |
| Technical Specifications | O | 프로토콜, 데이터 구조, 통신 패턴 | 의사코드 수준. 코드 인터페이스는 plan.md에 위임 |
| UI/UX Specifications | △ | 화면 구성, 인터랙션 | 해당 시에만 |
| Related Issues | O | 관련 Linear Issue 목록 | 테이블. feature-close 시 자동 갱신 |
| Change Log | O | 변경 이력 | 날짜 + 요약 |

> **역할 분리**: spec은 "What/Why" 명세. plan.md는 "How" 설계. 중복 기술 금지.

---

## 템플릿

```markdown
---
title: {spec 제목}
type: spec
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

> ← [Spec Index](./_index.md)

## Overview

| 항목 | 내용 |
|------|------|
| What | {한 줄 설명} |
| Why | {필요성} |
| Scope | {대상 범위} |

## Functional Requirements

| # | 요구사항 | 상세 | 비고 |
|---|---------|------|------|
| FR-1 | {요구사항} | {수치/규칙} | |

## Non-Functional Requirements

| # | 요구사항 | 기준 | 비고 |
|---|---------|------|------|
| NFR-1 | {요구사항} | {측정 가능한 기준} | |

## Technical Specifications

{프로토콜, 데이터 구조, 통신 패턴 등 기술 명세}

## UI/UX Specifications

{화면 구성, 인터랙션 — 해당 시에만}

## Related Issues

| Linear ID | 제목 | 상태 |
|-----------|------|------|

## Change Log

| 날짜 | 변경 내용 |
|------|----------|
| {YYYY-MM-DD} | 초기 작성 |
```
