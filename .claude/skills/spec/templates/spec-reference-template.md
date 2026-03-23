# spec-reference-template.md — Reference 보고서 템플릿

spec G2 조사에서 보고서 수준의 결과가 생성될 때 사용하는 템플릿.
`docs/spec/{spec-name}/references/` 하위에 저장한다.

> 완료된 보고서는 수정 금지 — 새 보고서로 대체 (불변 원칙).

## 템플릿: Reference 보고서

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
