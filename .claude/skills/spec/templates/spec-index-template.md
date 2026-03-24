# spec `_index.md` 템플릿

spec 디렉토리의 진입점. Overview, Out of Scope, 문서 목록, 관련 이슈, 변경 이력을 포함한다.

> 공통 규칙: [spec-template.md](./spec-template.md)

## 템플릿

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

| 문서 | 설명 |
|------|------|
| [requirements.md](./requirements.md) | 기능 요구사항 (FR, 제약, 정책) |
| [technical.md](./technical.md) | 기술 설계 (인터페이스, API) |
| [roadmap.md](./roadmap.md) | 구현 로드맵 (Issue 분할, 의존성) — △ 선택 |

## References

{G2 조사에서 보고서 생성 시에만 포함. 보고서 없으면 이 섹션 자체 생략}

| 보고서 | 설명 |
|--------|------|
| [references/{report-name}.md](./references/{report-name}.md) | {조사 대상 요약} |

## Related Issues

| Linear ID | 제목 | 상태 |
|-----------|------|------|

## Change Log

| 날짜 | FR-ID | 변경 유형 | 변경 내용 |
|------|-------|----------|----------|
| {YYYY-MM-DD} | -- | -- | 초기 작성 |
```

## 섹션 규칙

| 섹션 | 필수 | 비고 |
|------|:----:|------|
| Overview | O | What + Why + Scope. 각 1문장 |
| Out of Scope | O | 경계 명확화. 불릿 목록. **이 섹션은 _index.md에만 존재** (SSOT 단일화) |
| Documents | O | 고정 3파일 + roadmap 선택 표기 |
| References | △ | G2 보고서 존재 시에만 |
| Related Issues | O | feature-close 시 자동 갱신 |
| Change Log | O | 4-컬럼: 날짜 / FR-ID / 변경 유형(added/modified/removed) / 요약. FR 무관 시 `--` |
