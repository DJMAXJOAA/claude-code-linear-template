# cl.md 템플릿

> docs-writing.md §3-3 Nav Link 규칙 참조

```markdown
---
linear_id: {LINEAR-ID}
title: CL: {Issue 제목}
type: checklist
created: {YYYY-MM-DD}
---

> ← [_index.md](./_index.md) | [Linear Issue]({URL}) | [plan.md](plan.md)

## S1. Tasks

| # | ID | Task | Dependencies | Status |
|---|-----|------|-------------|--------|
| 1 | T-{LINEAR-ID}-01 | {태스크 제목} | — | pending |
| 2 | T-{LINEAR-ID}-02 | {태스크 제목} | T-{LINEAR-ID}-01 | pending |

## S2. Done Criteria

> Linear Issue description의 Success Criteria 참조

## S3. Verification

| # | FR-ID | 검증 항목 | 방법 | 기대 결과 |
|---|-------|----------|------|----------|
| 1 | FR-001 | {항목} | {방법} | {결과} |

> FR-ID 규칙: spec의 FR-NNN 참조. spec 미존재 또는 FR-ID 미보유(grandfathered) 시 `--` 기입. 복수 FR 매핑 가능: `FR-001, FR-003`. 다른 spec 참조 시: `{spec-name}:FR-NNN`.

## S4. Manual Testing Guide

| # | 테스트 항목 | 실행 시나리오 | 기대 결과 |
|---|-----------|-------------|----------|
| 1 | {항목} | {시나리오/명령어} | {결과} |

## Handoff

| 항목 | 내용 |
|------|------|
| 마지막 완료 태스크 | — |
| 다음 태스크 | T-{LINEAR-ID}-01 |
| 비고 | 초기 상태 |
```

## 태스크 ID 형식

`T-{LINEAR-ID}-NN` (예: `T-PRJ-47-01`)
